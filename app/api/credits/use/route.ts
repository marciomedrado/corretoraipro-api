import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { user_id, app, action, description } = await req.json();

    if (!user_id || !app || !action) {
      return NextResponse.json(
        { success: false, error: "missing_parameters" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("process_action", {
      uid: user_id,
      app,
      action,
      description: description ?? null
    });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (data === false) {
      return NextResponse.json(
        { success: false, error: "insufficient_credits" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "server_error" },
      { status: 500 }
    );
  }
}
