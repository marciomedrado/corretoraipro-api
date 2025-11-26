import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const sig = req.headers.get("stripe-signature")!;
    const body = await req.text();

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session: any = event.data.object;

      const user_id = session.metadata.user_id;
      const credits = Number(session.metadata.credits);

      await supabase.from("transactions").insert({
        user_id,
        type: "add",
        credits,
        amount: session.amount_total / 100,
        source: "stripe",
        description: "Stripe purchase"
      });
    }

    return NextResponse.json({ received: true });

  } catch (err: any) {
    console.error("Webhook error:", err.message);
    return new NextResponse(err.message, { status: 400 });
  }
}
