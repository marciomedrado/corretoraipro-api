import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "missing_user_id" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("type, credits")
      .eq("user_id", user_id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const balance = data.reduce((sum, row) => {
      return row.type === "add"
        ? sum + row.credits
        : sum - row.credits;
    }, 0);

    return NextResponse.json({ success: true, balance });

  } catch (err) {
    return NextResponse.json(
      { success: false, error: "server_error" },
      { status: 500 }
    );
  }
}
