"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatWindowProps {
  roomId: string;
  currentUserId: string;
  otherUserName: string;
}

export default function ChatWindow({
  roomId,
  currentUserId,
  otherUserName,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const lastSeenKey = `chat-last-seen-${roomId}`;
    localStorage.setItem(lastSeenKey, new Date().toISOString());

    async function loadMessages() {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    }

    loadMessages();

    const channel = supabase
      .channel(`chat-room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const nextMessage = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((item) => item.id === nextMessage.id)) {
              return prev;
            }
            return [...prev, nextMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!content.trim()) return;

    setSending(true);

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          content: content.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "ไม่สามารถส่งข้อความได้");
      }

      setContent("");
    } catch (error) {
      console.error("Send message failed:", error);
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการส่งข้อความ");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[620px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Chat</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">{otherUserName}</h2>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            เริ่มต้นบทสนทนากับผู้แจ้งรายการได้เลย
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_id === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    isMine
                      ? "bg-emerald-500 text-white"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  {message.content}
                  <div className={`mt-1 text-[10px] ${isMine ? "text-emerald-100" : "text-slate-400"}`}>
                    {new Date(message.created_at).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-slate-200 bg-white p-4">
        <div className="flex gap-3">
          <input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "กำลังส่ง..." : "ส่ง"}
          </button>
        </div>
      </form>
    </div>
  );
}
