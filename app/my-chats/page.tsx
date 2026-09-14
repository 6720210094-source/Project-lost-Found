"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface ChatRoom {
  id: string;
  item_id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

interface ItemInfo {
  id: string;
  title: string;
  type: string;
}

interface ChatRoomWithMeta extends ChatRoom {
  item: ItemInfo | null;
  otherUserName: string;
  lastMessage: string | null;
}

export default function MyChatsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<ChatRoomWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRooms() {
      const { data: currentUser } = await supabase.auth.getUser();
      const currentUserId = currentUser.user?.id;

      if (!currentUserId) {
        setLoading(false);
        return;
      }

      setUser(currentUser.user);

      const { data: roomData, error } = await supabase
        .from("chat_rooms")
        .select("*")
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
        .order("created_at", { ascending: false });

      if (error || !roomData) {
        setLoading(false);
        return;
      }

      const enrichedRooms: ChatRoomWithMeta[] = [];

      for (const room of roomData) {
        const otherUserId = room.user1_id === currentUserId ? room.user2_id : room.user1_id;
        const { data: userData } = await supabase
          .from("users")
          .select("name, email")
          .eq("id", otherUserId)
          .single();

        const { data: itemData } = await supabase
          .from("items")
          .select("id, title, type")
          .eq("id", room.item_id)
          .single();

        const { data: messages } = await supabase
          .from("chat_messages")
          .select("content, created_at")
          .eq("room_id", room.id)
          .order("created_at", { ascending: false })
          .limit(1);

        enrichedRooms.push({
          ...room,
          item: itemData || null,
          otherUserName: userData?.name || userData?.email || "ผู้ใช้",
          lastMessage: messages?.[0]?.content || null,
        });
      }

      setRooms(enrichedRooms);
      setLoading(false);
    }

    loadRooms();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-4xl">🔒</p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">กรุณาเข้าสู่ระบบก่อนดูห้องแชท</h1>
          <Link href="/login" className="mt-6 inline-block rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Chat</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">ห้องแชทของฉัน</h1>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            กำลังโหลดห้องแชท...
          </div>
        ) : rooms.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            ยังไม่มีห้องแชทที่เริ่มต้น
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                      {room.item?.type === "FOUND" ? "ของพบ" : "ของหาย"}
                    </p>
                    <h2 className="mt-2 text-lg font-bold text-slate-900">{room.item?.title || "รายการที่ไม่พบ"}</h2>
                    <p className="mt-1 text-sm text-slate-500">กับ {room.otherUserName}</p>
                    <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                      {room.lastMessage || "เริ่มแชทกันเลย"}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    เปิดแชท
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
