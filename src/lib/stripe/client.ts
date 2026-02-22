import Stripe from "stripe";

/**
 * Server-side Stripe SDK client.
 * ⚠️  ONLY use this in API routes and server actions.
 *
 * Uses lazy initialization to prevent build-time errors when
 * STRIPE_SECRET_KEY is not yet set.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
    if (!_stripe) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("STRIPE_SECRET_KEY is not set");
        }
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2026-01-28.clover",
            typescript: true,
        });
    }
    return _stripe;
}

/** @deprecated Use getStripe() instead */
export const stripe = typeof process !== "undefined" && process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2026-01-28.clover",
        typescript: true,
    })
    : (null as unknown as Stripe);
