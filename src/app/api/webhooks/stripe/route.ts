import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/insforge/admin";

/**
 * Determine plan_type from the Stripe Price ID.
 */
function getPlanTypeFromPriceId(priceId: string): "member" | "inner_circle" {
    const innerCirclePriceIds = [
        process.env.STRIPE_INNER_CIRCLE_MONTHLY_PRICE_ID,
        process.env.STRIPE_INNER_CIRCLE_ANNUAL_PRICE_ID,
    ];
    return innerCirclePriceIds.includes(priceId) ? "inner_circle" : "member";
}

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events to keep Supabase profiles in sync.
 *
 * Events handled:
 * - checkout.session.completed → activate subscription
 * - invoice.paid → confirm renewal
 * - invoice.payment_failed → mark as past_due
 * - customer.subscription.deleted → deactivate subscription
 * - customer.subscription.updated → handle upgrades/downgrades
 */
export async function POST(request: Request) {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = getStripe().webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = createAdminClient();

    try {
        switch (event.type) {
            // ── Checkout completed ────────────────────────
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.supabase_user_id;
                const subscriptionId =
                    typeof session.subscription === "string"
                        ? session.subscription
                        : session.subscription?.id;

                if (!userId || !subscriptionId) break;

                // Get the subscription to find the price ID
                const subscription =
                    await getStripe().subscriptions.retrieve(subscriptionId);
                const priceId = subscription.items.data[0]?.price?.id ?? "";
                const planType = getPlanTypeFromPriceId(priceId);

                await supabase
                    .from("profiles")
                    .update({
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: subscriptionId,
                        plan_type: planType,
                        subscription_status: "active",
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", userId);

                break;
            }

            // ── Invoice paid (renewal) ────────────────────
            case "invoice.paid": {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId =
                    typeof invoice.customer === "string"
                        ? invoice.customer
                        : invoice.customer?.id;

                if (!customerId) break;

                await supabase
                    .from("profiles")
                    .update({
                        subscription_status: "active",
                        updated_at: new Date().toISOString(),
                    })
                    .eq("stripe_customer_id", customerId);

                break;
            }

            // ── Payment failed ────────────────────────────
            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId =
                    typeof invoice.customer === "string"
                        ? invoice.customer
                        : invoice.customer?.id;

                if (!customerId) break;

                await supabase
                    .from("profiles")
                    .update({
                        subscription_status: "past_due",
                        updated_at: new Date().toISOString(),
                    })
                    .eq("stripe_customer_id", customerId);

                break;
            }

            // ── Subscription canceled ─────────────────────
            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId =
                    typeof subscription.customer === "string"
                        ? subscription.customer
                        : subscription.customer?.id;

                if (!customerId) break;

                await supabase
                    .from("profiles")
                    .update({
                        subscription_status: "canceled",
                        plan_type: "none",
                        stripe_subscription_id: null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("stripe_customer_id", customerId);

                break;
            }

            // ── Subscription updated (upgrade/downgrade) ──
            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId =
                    typeof subscription.customer === "string"
                        ? subscription.customer
                        : subscription.customer?.id;

                if (!customerId) break;

                const priceId = subscription.items.data[0]?.price?.id ?? "";
                const planType = getPlanTypeFromPriceId(priceId);
                const status = subscription.status;

                const mappedStatus =
                    status === "active"
                        ? "active"
                        : status === "past_due"
                            ? "past_due"
                            : status === "canceled"
                                ? "canceled"
                                : status === "trialing"
                                    ? "trialing"
                                    : "none";

                await supabase
                    .from("profiles")
                    .update({
                        plan_type: planType,
                        subscription_status: mappedStatus,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("stripe_customer_id", customerId);

                break;
            }
        }
    } catch (err) {
        console.error("Error processing webhook event:", err);
        return NextResponse.json(
            { error: "Webhook processing error" },
            { status: 500 }
        );
    }

    return NextResponse.json({ received: true });
}
