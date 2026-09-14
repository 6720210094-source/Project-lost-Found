"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import ChatWindow from "@/components/ChatWindow";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface ChatRoom {
  id: string;
  item_id: string;
  user1_id: string;
  user2_id: string;
}

interface ItemInfo {
  id: string;
  title: string;
  type: string;
}

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
}

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [item, setItem] = useState<ItemInfo | null>(null);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoom() {
      if (!roomId || typeof roomId !== "string") return;

      setLoading(true);

      const { data: currentUserData } = await supabase.auth.getUser();
      setCurrentUser(currentUserData.user);

      const { data: roomData, error: roomError } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (roomError || !roomData) {
        setLoading(false);
        return;
      }

      setRoom(roomData);

      const { data: itemData } = await supabase
        .from("items")
        .select("id, title, type")
        .eq("id", roomData.item_id)
        .single();

      if (itemData) {
        setItem(itemData);
      }

      const otherUserId =
        currentUserData.user?.id === roomData.user1_id ? roomData.user2_id : roomData.user1_id;

      if (otherUserId) {
        const { data: userData } = await supabase
          .from("users")
          .select("id, name, email")
          .eq("id", otherUserId)
          .single();

        if (userData) {
          setOtherUser(userData);
        }
      }

      setLoading(false);
    }

    loadRoom();
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="py-20 text-center text-slate-500">กำลังโหลดห้องแชท...</div>
      </div>
    );
  }

  if (!room || !currentUser || !otherUser) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-4xl">💬</p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">ไม่พบห้องแชท</h1>
          <Link href="/lost" className="mt-5 inline-block text-sm font-semibold text-emerald-600">
            ← กลับไปหน้ารายการของหาย
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link href={item?.type === "FOUND" ? "/found" : "/lost"} className="mb-6 inline-flex text-sm font-semibold text-slate-500 hover:text-emerald-600">
          ← กลับไปหน้า {item?.type === "FOUND" ? "ของพบ" : "ของหาย"}
        </Link>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Chat Room</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{item?.title || "ห้องแชท"}</h1>
          <p className="mt-1 text-sm text-slate-500">
            กำลังคุยกับ {otherUser.name || otherUser.email || "ผู้แจ้งรายการ"}
          </p>
        </div>

        <ChatWindow
          roomId={room.id}
          currentUserId={currentUser.id}
          otherUserName={otherUser.name || otherUser.email || "ผู้แจ้งรายการ"}
        />
      </main>
    </div>
  );
}
