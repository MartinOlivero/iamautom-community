import "dotenv/config";
import Stripe from "stripe";

try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2026-01-28.clover",
    });

    console.log("Stripe init successful");

    const customers = await stripe.customers.list({ limit: 1 });
    console.log("Customers listed:", customers.data.length);
} catch (err) {
    console.error("Stripe Error:", err.message);
}
