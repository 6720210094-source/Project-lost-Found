"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type Item = {
  id: string;
  title: string;
  image_url: string | null;
  status: string;
  type: string;
  location: string | null;
};

export default function HandoverPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      const { data, error } = await supabase
        .from("items")
        .select("id, title, image_url, status, type, location")
        .eq("status", "PENDING")
        .order("created_at", { ascending: false });

      if (!error) setItems((data ?? []) as Item[]);
      setLoading(false);
    };

    void loadItems();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-500">
            Handover
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">
            ส่งมอบของคืน
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            เลือกรายการที่ต้องการส่งคืน แล้วกดเข้าไปที่รายละเอียดเพื่อยืนยันการรับของ
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">
            กำลังโหลดรายการ...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            ไม่มีรายการที่รอส่งมอบ
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/item/${item.id}`}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-48 bg-slate-100">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">📦</div>
                  )}
                </div>
                <div className="p-5">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                    รอการส่งมอบ
                  </span>
                  <h2 className="mt-3 text-lg font-bold text-slate-900">{item.title}</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    📍 {item.location || "ไม่ระบุตำแหน่ง"}
                  </p>
                  <span className="mt-4 inline-flex rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white">
                    เปิดรายการ
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
