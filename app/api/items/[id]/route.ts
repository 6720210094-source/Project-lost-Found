import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, type } = body;

    if (!status && !type) {
      return NextResponse.json(
        { error: "ต้องระบุข้อมูลที่ต้องการอัปเดต" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" },
        { status: 401 }
      );
    }

    const { data: existingItem, error: fetchError } = await supabase
      .from("items")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingItem) {
      return NextResponse.json({ error: "ไม่พบรายการที่ต้องการอัปเดต" }, { status: 404 });
    }

    if (existingItem.user_id !== userData.user.id) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์อัปเดตรายการนี้" },
        { status: 403 }
      );
    }

    const updatePayload: Record<string, string> = {};

    if (status) updatePayload.status = status;
    if (type) updatePayload.type = type;

    const { data, error } = await supabase
      .from("items")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      item: data?.[0] || null,
    });
  } catch (error) {
    console.error("Update item error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตรายการ" },
      { status: 500 }
    );
  }
}
