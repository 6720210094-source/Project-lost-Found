"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface Item {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  image_url: string | null;
  status: string;
  created_at: string;
}

export default function FoundPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทุกหมวดหมู่");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("items").select("*").eq("type", "FOUND").order("created_at", { ascending: false });

    if (selectedCategory !== "ทุกหมวดหมู่") {
      query = query.eq("category", selectedCategory);
    }

    if (search.trim()) {
      query = query.ilike("title", `%${search.trim()}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  }, [selectedCategory, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-100">
            Found Items
          </p>
          <h1 className="text-4xl font-bold md:text-5xl">ของพบ</h1>
          <p className="mt-4 max-w-2xl text-lg text-emerald-100">
            ดูรายการสิ่งของที่มีผู้พบภายในมหาวิทยาลัย เผื่อเป็นของที่คุณกำลังตามหา
          </p>

          <div className="mt-8">
            <Link
              href="/report-found"
              className="inline-block rounded-xl bg-white px-6 py-3 font-semibold text-emerald-600 shadow-lg transition hover:bg-emerald-50"
            >
              + แจ้งของพบ
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_220px_180px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาของที่พบ..."
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
              />

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
              >
                <option>ทุกหมวดหมู่</option>
                <option>อุปกรณ์อิเล็กทรอนิกส์</option>
                <option>กระเป๋า</option>
                <option>เอกสาร</option>
                <option>เสื้อผ้า</option>
                <option>ของใช้ส่วนตัว</option>
                <option>อื่น ๆ</option>
              </select>

              <button
                onClick={fetchItems}
                className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600"
              >
                ค้นหา
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-slate-900">รายการของพบ</h2>
          <p className="mt-1 mb-6 text-sm text-slate-500">พบ {items.length} รายการ</p>

          {loading ? (
            <div className="mt-12 text-center text-slate-500">กำลังโหลดข้อมูลสิ่งของ...</div>
          ) : items.length === 0 ? (
            <div className="mt-12 text-center rounded-2xl border border-slate-200 bg-white p-12">
              <p className="text-4xl">📦</p>
              <p className="mt-4 font-bold text-slate-700 text-lg">ยังไม่มีรายการของพบ</p>
              <p className="mt-1 text-sm text-slate-400">คุณสามารถแจ้งประกาศสิ่งของที่พบได้ตลอดเวลา</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/item/${item.id}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex h-48 items-center justify-center bg-slate-100 overflow-hidden">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-6xl">📦</span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        {item.status === "RESOLVED" ? "ส่งคืนแล้ว" : "ของพบ"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(item.created_at).toLocaleDateString("th-TH")}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">หมวดหมู่: {item.category}</p>
                    <p className="mt-1 text-sm text-slate-500">📍 {item.location}</p>

                    <div className="mt-5 border-t border-slate-100 pt-4 text-sm font-semibold text-emerald-600">
                      ดูรายละเอียด →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}