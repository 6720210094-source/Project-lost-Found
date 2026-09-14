import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, content } = body;

    if (!roomId || !content || !String(content).trim()) {
      return NextResponse.json(
        { error: "ข้อความไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนส่งข้อความ" },
        { status: 401 }
      );
    }

    const currentUserId = userData.user.id;
    const { data: roomData, error: roomError } = await supabase
      .from("chat_rooms")
      .select("id, user1_id, user2_id")
      .eq("id", roomId)
      .single();

    if (roomError || !roomData) {
      return NextResponse.json({ error: "ไม่พบห้องแชท" }, { status: 404 });
    }

    if (roomData.user1_id !== currentUserId && roomData.user2_id !== currentUserId) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ส่งข้อความในห้องนี้" },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .insert([
        {
          room_id: roomId,
          sender_id: currentUserId,
          content: String(content).trim(),
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: data });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการส่งข้อความ" },
      { status: 500 }
    );
  }
}
