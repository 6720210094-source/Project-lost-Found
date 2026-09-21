"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

interface Item {
  id: string;
  title: string;
  image_url: string | null;
  type: string | null;
  description: string | null;
  location: string | null;
}

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
}

interface HandoverRecord {
  id: string;
  item_id: string;
  giver_id: string;
  receiver_id: string;
  proof_image_url: string | null;
  verification_code: string | null;
  status: string;
  completed_at: string | null;
  created_at: string | null;
  item: Item | null;
  giver: UserProfile | null;
  receiver: UserProfile | null;
}

export default function HandoverHistoryPage() {
  const [records, setRecords] = useState<HandoverRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedSignatureUrl, setSelectedSignatureUrl] = useState<string | null>(null);
  const [selectedRecordTitle, setSelectedRecordTitle] = useState<string>("");

  useEffect(() => {
    const loadCurrentUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setCurrentUserId(null);
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);
    };

    void loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);

      try {
        // 1. Fetch handover_proofs joined with items
        const { data: proofsData, error: proofsError } = await supabase
          .from("handover_proofs")
          .select(`
            id,
            item_id,
            giver_id,
            receiver_id,
            proof_image_url,
            verification_code,
            status,
            completed_at,
            created_at,
            items (
              id,
              title,
              image_url,
              type,
              description,
              location
            )
          `)
          .eq("status", "completed")
          .or(`giver_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
          .order("completed_at", { ascending: false });

        if (proofsError) {
          console.error("Load handover history failed:", proofsError.message || proofsError);
          setRecords([]);
          setLoading(false);
          return;
        }

        if (!proofsData || proofsData.length === 0) {
          setRecords([]);
          setLoading(false);
          return;
        }

        // 2. Collect unique user IDs to fetch profile details
        const userIds = Array.from(
          new Set(
            proofsData
              .flatMap((p) => [p.giver_id, p.receiver_id])
              .filter(Boolean)
          )
        );

        // Fetch user profiles (Fallback to users or profiles table)
        let profilesMap: Record<string, UserProfile> = {};
        if (userIds.length > 0) {
          const { data: usersData } = await supabase
            .from("profiles") // หรือเปลี่ยนเป็น "users" ตามชื่อตารางในระบบของคุณ
            .select("id, name, email")
            .in("id", userIds);

          if (usersData) {
            profilesMap = usersData.reduce((acc, user) => {
              acc[user.id] = user;
              return acc;
            }, {} as Record<string, UserProfile>);
          }
        }

        // 3. Map final normalized records
        const normalizedRecords: HandoverRecord[] = proofsData.map((record: any) => {
          const itemData = Array.isArray(record.items) ? record.items[0] : record.items;

          return {
            id: record.id,
            item_id: record.item_id,
            giver_id: record.giver_id,
            receiver_id: record.receiver_id,
            proof_image_url: record.proof_image_url,
            verification_code: record.verification_code,
            status: record.status,
            completed_at: record.completed_at,
            created_at: record.created_at,
            item: itemData || null,
            giver: profilesMap[record.giver_id] || { id: record.giver_id, name: null, email: null },
            receiver: profilesMap[record.receiver_id] || { id: record.receiver_id, name: null, email: null },
          };
        });

        setRecords(normalizedRecords);
      } catch (err) {
        console.error("Unexpected error loading history:", err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchHistory();
  }, [currentUserId]);

  const openSignaturePreview = (url: string | null, title: string) => {
    if (!url) return;
    setSelectedSignatureUrl(url);
    setSelectedRecordTitle(title);
  };

  const closeSignaturePreview = () => {
    setSelectedSignatureUrl(null);
    setSelectedRecordTitle("");
  };

  if (!currentUserId && !loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">🔒</div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">กรุณาเข้าสู่ระบบก่อนดูประวัติ</h1>
            <p className="mt-2 text-slate-600">เพื่อดูประวัติการส่งมอบ กรุณาเข้าสู่ระบบก่อน</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-500">History</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">ประวัติการส่งมอบ</h1>
          </div>
          <div className="rounded-full border border-rose-100 bg-white px-3 py-1.5 text-sm font-semibold text-rose-600 shadow-sm">
            {records.length} รายการ
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
            กำลังโหลดประวัติการส่งมอบ...
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-sm">
            ยังไม่มีประวัติการส่งมอบที่สำเร็จ
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {records.map((record) => {
              const item = record.item;
              const giver = record.giver;
              const receiver = record.receiver;

              if (!item) return null;

              const completedDate = record.completed_at
                ? new Date(record.completed_at).toLocaleString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-";

              const giverName = giver?.name || giver?.email || "ไม่ทราบชื่อ";
              const receiverName = receiver?.name || receiver?.email || "ไม่ทราบชื่อ";

              return (
                <article
                  key={record.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="flex gap-4 p-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-slate-100">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl">📦</div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-bold text-slate-900">{item.title}</h2>
                          <p className="mt-1 text-sm text-slate-500">{item.type || "รายการ"}</p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                          completed
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-slate-500">ผู้ส่งมอบ</span>
                          <span className="truncate text-right text-slate-800">{giverName}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-slate-500">ผู้รับมอบ</span>
                          <span className="truncate text-right text-slate-800">{receiverName}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-slate-500">วันและเวลา</span>
                          <span className="text-right text-slate-800">{completedDate}</span>
                        </div>
                        {record.verification_code && (
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-slate-500">รหัสยืนยัน</span>
                            <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-slate-800">
                              {record.verification_code}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openSignaturePreview(record.proof_image_url, item.title)}
                      disabled={!record.proof_image_url}
                      className="inline-flex rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      ดูรูปภาพลายเซ็นดิจิทัล
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {selectedSignatureUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Signature Proof</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">{selectedRecordTitle}</h3>
              </div>
              <button
                type="button"
                onClick={closeSignaturePreview}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <div className="relative h-[420px] w-full">
                <Image
                  src={selectedSignatureUrl}
                  alt="Signature proof"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}