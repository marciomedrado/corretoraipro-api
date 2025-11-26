import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const { user_id, credits } = await req.json();

    if (!user_id || !credits) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Pega saldo atual
    const { data, error } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user_id)
      .single();

    if (error) throw error;

    if (data.credits < credits) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
    }

    // Deduz créditos
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ credits: data.credits - credits })
      .eq("id", user_id);

    if (updateError) throw updateError;

    // Cria registro na tabela transactions
    await supabase.from("transactions").insert({
      user_id,
      type: "consume",
      credits,
      created_at: new Date().toISOString(),
      source: "app",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

