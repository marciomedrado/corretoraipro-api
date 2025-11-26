import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { user_id, credits, description } = await req.json();

    if (!user_id || !credits) {
      return NextResponse.json(
        { success: false, error: "missing_parameters" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("transactions").insert({
      user_id,
      type: "add",
      credits,
      source: "manual",
      description: description ?? null
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json(
      { success: false, error: "server_error" },
      { status: 500 }
    );
  }
}
