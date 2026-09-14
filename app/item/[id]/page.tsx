"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import ItemImage from "@/components/ItemImage";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface Item {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  image_url: string | null;
  type: string;
  status: string;
  created_at: string;
  user_id: string;
}

interface UserProfile {
  name: string | null;
  phone: string | null;
  email: string | null;
}

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState<Item | null>(null);
  const [reporter, setReporter] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setItem(data);

        // Fetch reporter info
        if (data.user_id) {
          const { data: userData } = await supabase
            .from("users")
            .select("name, phone, email")
            .eq("id", data.user_id)
            .single();

          if (userData) {
            setReporter(userData);
          }
        }
      }
      setLoading(false);
    }

    loadItem();
  }, [id]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  const handleResolveReport = async () => {
    if (!item || !currentUser || currentUser.id !== item.user_id) {
      return;
    }

    setUpdatingStatus(true);

    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "RESOLVED",
          type: "FOUND",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "ไม่สามารถเปลี่ยนสถานะได้");
      }

      setItem((prev) => (
        prev ? { ...prev, status: "RESOLVED", type: "FOUND" } : prev
      ));
      router.push("/found");
    } catch (error) {
      console.error("Resolve item error:", error);
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStartChat = async () => {
    if (!item || !currentUser || !item.user_id) {
      return;
    }

    if (currentUser.id === item.user_id) {
      alert("คุณเป็นเจ้าของโพสต์นี้ ไม่จำเป็นต้องทักแชทกับตัวเอง");
      return;
    }

    setStartingChat(true);

    try {
      const response = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: item.id,
          otherUserId: item.user_id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "ไม่สามารถเริ่มห้องแชทได้");
      }

      router.push(`/chat/${result.room.id}`);
    } catch (error) {
      console.error("Start chat error:", error);
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเริ่มห้องแชท");
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="py-20 text-center text-slate-500">กำลังโหลดรายละเอียด...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="py-20 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-4 font-bold text-slate-700 text-lg">ไม่พบข้อมูลรายการนี้</p>
          <Link href="/" className="mt-4 inline-block font-semibold text-blue-600">
            ← กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  const isFound = item.type === "FOUND";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href={isFound ? "/found" : "/lost"}
            className="mb-6 inline-flex text-sm font-semibold text-slate-500 hover:text-blue-600"
          >
            ← กลับไปหน้า {isFound ? "ของพบ" : "ของหาย"}
          </Link>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid md:grid-cols-2">

              {currentUser && currentUser.id === item.user_id && item.status !== "RESOLVED" && (
                <div className="border-b border-slate-200 bg-slate-50 p-4 md:col-span-2">
                  <button
                    type="button"
                    onClick={handleResolveReport}
                    disabled={updatingStatus}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updatingStatus ? "กำลังอัปเดต..." : "ทำรายการส่งคืนแล้ว"}
                  </button>
                </div>
              )}

              {/* รูปภาพ */}
              <div className="flex min-h-[350px] items-center justify-center bg-slate-100 overflow-hidden">
                {item.image_url ? (
                  <ItemImage
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-8xl">{isFound ? "📦" : "🎒"}</span>
                )}
              </div>

              {/* ข้อมูล */}
              <div className="p-8 md:p-10">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isFound
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isFound ? "ของพบ" : "แจ้งของหาย"}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === "RESOLVED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.status === "RESOLVED" ? "ส่งคืนแล้ว" : "กำลังตามหา"}
                  </span>
                </div>

                <div className="mb-6 flex flex-wrap gap-3">
                  {!currentUser || currentUser.id !== item.user_id ? (
                    <button
                      type="button"
                      onClick={handleStartChat}
                      disabled={startingChat}
                      className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {startingChat ? "กำลังเริ่มแชท..." : "ทักแชทหาผู้แจ้ง"}
                    </button>
                  ) : null}
                </div>

                <h1 className="text-3xl font-bold text-slate-900">{item.title}</h1>

                <div className="my-6 space-y-4 border-y border-slate-100 py-5">
                  <div>
                    <p className="text-xs text-slate-400">หมวดหมู่</p>
                    <p className="mt-1 font-semibold text-slate-800">{item.category}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">สถานที่{isFound ? "พบ" : "หาย"}</p>
                    <p className="mt-1 font-semibold text-slate-800">📍 {item.location}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">วันที่แจ้ง</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      📅 {new Date(item.created_at).toLocaleDateString("th-TH")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">รายละเอียด</p>
                    <p className="mt-1 leading-7 text-slate-600">
                      {item.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                    </p>
                  </div>

                  {reporter && (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        📞 ข้อมูลผู้แจ้งรายการ
                      </p>
                      {reporter.name && (
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          ชื่อ: {reporter.name}
                        </p>
                      )}
                      {reporter.phone && (
                        <p className="mt-1 text-sm text-blue-700 font-bold">
                          เบอร์โทรศัพท์: {reporter.phone}
                        </p>
                      )}
                      {reporter.email && (
                        <p className="mt-1 text-xs text-slate-500">อีเมล: {reporter.email}</p>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}