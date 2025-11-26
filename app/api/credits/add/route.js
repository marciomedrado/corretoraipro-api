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

    // 1. Atualiza os créditos no profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ credits: supabase.rpc('increment', { x: credits }) })
      .eq("id", user_id);

    if (updateError) throw updateError;

    // 2. Cria transação
    await supabase.from("transactions").insert({
      user_id,
      type: "add",
      credits,
      created_at: new Date().toISOString(),
      source: "manual",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

