import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, otherUserId } = body;

    if (!itemId || !otherUserId) {
      return NextResponse.json(
        { error: "ต้องระบุ itemId และ otherUserId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนเริ่มแชท" },
        { status: 401 }
      );
    }

    const currentUserId = userData.user.id;

    if (currentUserId === otherUserId) {
      return NextResponse.json(
        { error: "คุณไม่สามารถแชทกับตัวเองได้" },
        { status: 400 }
      );
    }

    const { data: itemData, error: itemError } = await supabase
      .from("items")
      .select("id, title, user_id")
      .eq("id", itemId)
      .single();

    if (itemError || !itemData) {
      return NextResponse.json({ error: "ไม่พบรายการนี้" }, { status: 404 });
    }

    const sortedUserIds =
      currentUserId < otherUserId
        ? [currentUserId, otherUserId]
        : [otherUserId, currentUserId];

    const { data: existingRooms, error: roomFetchError } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("item_id", itemId);

    if (roomFetchError) {
      return NextResponse.json({ error: roomFetchError.message }, { status: 500 });
    }

    const existingRoom = existingRooms?.find(
      (room) =>
        room.user1_id === sortedUserIds[0] && room.user2_id === sortedUserIds[1]
    );

    if (existingRoom) {
      return NextResponse.json({ room: existingRoom, item: itemData });
    }

    const { data: roomData, error: createError } = await supabase
      .from("chat_rooms")
      .insert([
        {
          item_id: itemId,
          user1_id: sortedUserIds[0],
          user2_id: sortedUserIds[1],
        },
      ])
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({ room: roomData, item: itemData });
  } catch (error) {
    console.error("Create chat room error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเริ่มห้องแชท" },
      { status: 500 }
    );
  }
}
