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
        process.env.STRIPE_INNER_CIRCLE_QUARTERLY_PRICE_ID,
        process.env.STRIPE_INNER_CIRCLE_BIANNUAL_PRICE_ID,
    ];
    return innerCirclePriceIds.includes(priceId) ? "inner_circle" : "member";
}

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events to keep Insforge profiles in sync.
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

    const db = createAdminClient();

    // Idempotency: check if this event was already processed
    const { data: existing } = await db
        .from("stripe_webhook_events")
        .select("id")
        .eq("event_id", event.id)
        .single();

    if (existing) {
        return NextResponse.json({ received: true, deduplicated: true });
    }

    // Record event before processing to prevent concurrent duplicates
    await db.from("stripe_webhook_events").insert({
        event_id: event.id,
        event_type: event.type,
        processed_at: new Date().toISOString(),
    });

    /** Helper: update profile and throw on DB error */
    async function updateProfile(filter: { id?: string; stripe_customer_id?: string }, data: Record<string, unknown>) {
        const query = db.from("profiles").update({ ...data, updated_at: new Date().toISOString() });
        if (filter.id) query.eq("id", filter.id);
        if (filter.stripe_customer_id) query.eq("stripe_customer_id", filter.stripe_customer_id);
        const { error, count } = await query.select("id", { count: "exact", head: true });
        if (error) throw new Error(`DB update failed: ${error.message}`);
        if (count === 0) console.warn(`Webhook ${event.type}: no profile matched`, filter);
    }

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

                const subscription =
                    await getStripe().subscriptions.retrieve(subscriptionId);
                const priceId = subscription.items.data[0]?.price?.id ?? "";
                const planType = getPlanTypeFromPriceId(priceId);

                await updateProfile({ id: userId }, {
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: subscriptionId,
                    plan_type: planType,
                    subscription_status: "active",
                });

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

                await updateProfile({ stripe_customer_id: customerId }, {
                    subscription_status: "active",
                });

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

                await updateProfile({ stripe_customer_id: customerId }, {
                    subscription_status: "past_due",
                });

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

                await updateProfile({ stripe_customer_id: customerId }, {
                    subscription_status: "canceled",
                    plan_type: "none",
                    stripe_subscription_id: null,
                });

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

                const statusMap: Record<string, string> = {
                    active: "active", past_due: "past_due",
                    canceled: "canceled", trialing: "trialing",
                };
                const mappedStatus = statusMap[status] || "none";

                await updateProfile({ stripe_customer_id: customerId }, {
                    plan_type: planType,
                    subscription_status: mappedStatus,
                });

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
