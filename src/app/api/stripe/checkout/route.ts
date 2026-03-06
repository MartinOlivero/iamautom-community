import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/insforge/server";
import { createAdminClient } from "@/lib/insforge/admin";

/**
 * Price ID mapping for each plan + billing cycle combination.
 */
const PRICE_MAP: Record<string, string> = {
    member_quarterly: process.env.STRIPE_MEMBER_QUARTERLY_PRICE_ID ?? "",
    member_biannual: process.env.STRIPE_MEMBER_BIANNUAL_PRICE_ID ?? "",
    inner_circle_quarterly: process.env.STRIPE_INNER_CIRCLE_QUARTERLY_PRICE_ID ?? "",
    inner_circle_biannual: process.env.STRIPE_INNER_CIRCLE_BIANNUAL_PRICE_ID ?? "",
};

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session for the authenticated user.
 * Body: { planType: 'member' | 'inner_circle', billingCycle: 'quarterly' | 'biannual' }
 */
export async function POST(request: Request) {
    try {
        // 1. Verify the user is authenticated
        const db = await createClient();
        const {
            data: { user },
        } = await db.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        // 2. Parse request body
        const { planType, billingCycle } = await request.json();
        const priceKey = `${planType}_${billingCycle}`;
        const priceId = PRICE_MAP[priceKey];

        if (!priceId) {
            return NextResponse.json(
                { error: "Plan o ciclo inválido" },
                { status: 400 }
            );
        }

        // 3. Get or create Stripe customer
        const adminDb = createAdminClient();
        const { data: profile } = await adminDb
            .from("profiles")
            .select("stripe_customer_id, full_name")
            .eq("id", user.id)
            .single();

        let customerId = profile?.stripe_customer_id;

        if (!customerId) {
            const customer = await getStripe().customers.create({
                email: user.email,
                name: profile?.full_name || undefined,
                metadata: { supabase_user_id: user.id },
            });
            customerId = customer.id;

            // Save the Stripe customer ID to the profile
            await adminDb
                .from("profiles")
                .update({ stripe_customer_id: customerId })
                .eq("id", user.id);
        }

        // 4. Create Checkout Session
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const session = await getStripe().checkout.sessions.create({
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            mode: "subscription",
            success_url: `${appUrl}/app/feed?checkout=success`,
            cancel_url: `${appUrl}/planes?checkout=canceled`,
            metadata: {
                supabase_user_id: user.id,
                plan_type: planType,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe checkout error:", error);
        return NextResponse.json(
            { error: "Error al crear sesión de pago" },
            { status: 500 }
        );
    }
}
