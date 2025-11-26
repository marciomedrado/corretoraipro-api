import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export async function POST(req) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = await buffer(req);
    const sig = req.headers.get("stripe-signature");

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return new Response(`Webhook error: ${err.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const user_id = session.metadata.user_id;
      const credits = parseInt(session.metadata.credits);

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      // 1. Atualiza os créditos do usuário
      const { data, error } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user_id)
        .single();

      if (!error) {
        await supabase
          .from("profiles")
          .update({ credits: data.credits + credits })
          .eq("id", user_id);
      }

      // 2. Registra transação
      await supabase.from("transactions").insert({
        user_id,
        type: "add",
        credits,
        amount: session.amount_total / 100,
        source: "stripe",
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

