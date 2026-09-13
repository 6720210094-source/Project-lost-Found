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

export default function LostPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทุกหมวดหมู่");
  const [selectedStatus, setSelectedStatus] = useState("ทุกสถานะ");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("items").select("*").eq("type", "LOST").order("created_at", { ascending: false });

    if (selectedCategory !== "ทุกหมวดหมู่") {
      query = query.eq("category", selectedCategory);
    }

    if (selectedStatus === "กำลังตามหา") {
      query = query.eq("status", "PENDING");
    } else if (selectedStatus === "ส่งคืนแล้ว") {
      query = query.eq("status", "RESOLVED");
    }

    if (search.trim()) {
      query = query.ilike("title", `%${search.trim()}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  }, [selectedCategory, selectedStatus, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 px-6 py-16">
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              🔴 Lost Items
            </span>

            <h1 className="mt-5 text-4xl font-bold text-white md:text-5xl">
              รายการของหาย
            </h1>

            <p className="mt-4 text-lg leading-8 text-red-50">
              ค้นหาสิ่งของที่สูญหายภายในมหาวิทยาลัย และตรวจสอบข้อมูลของแต่ละรายการได้ที่นี่
            </p>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Search & Filter */}
        <div className="-mt-20 relative rounded-3xl border border-slate-200 bg-white p-5 shadow-xl md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อสิ่งของ..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 outline-none transition focus:border-red-400 focus:bg-white"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-slate-600 outline-none"
            >
              <option>ทุกหมวดหมู่</option>
              <option>อุปกรณ์อิเล็กทรอนิกส์</option>
              <option>กระเป๋า</option>
              <option>เอกสาร</option>
              <option>เสื้อผ้า</option>
              <option>ของใช้ส่วนตัว</option>
              <option>อื่น ๆ</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-slate-600 outline-none"
            >
              <option>ทุกสถานะ</option>
              <option>กำลังตามหา</option>
              <option>ส่งคืนแล้ว</option>
            </select>

            <button
              onClick={fetchItems}
              className="rounded-xl bg-slate-900 px-7 py-3.5 font-semibold text-white transition hover:bg-red-600"
            >
              ค้นหา
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-red-600">LOST ITEMS</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">สิ่งของที่กำลังตามหา</h2>
            <p className="mt-1 text-sm text-slate-500">
              พบรายการทั้งหมด {items.length} รายการ
            </p>
          </div>

          <Link
            href="/report-lost"
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-red-700"
          >
            + แจ้งของหาย
          </Link>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="mt-12 text-center text-slate-500">กำลังโหลดข้อมูลสิ่งของ...</div>
        ) : items.length === 0 ? (
          <div className="mt-12 text-center rounded-2xl border border-slate-200 bg-white p-12">
            <p className="text-4xl">🎒</p>
            <p className="mt-4 font-bold text-slate-700 text-lg">ยังไม่มีรายการของหาย</p>
            <p className="mt-1 text-sm text-slate-400">คุณสามารถแจ้งประกาศของหายใหม่ได้ตลอดเวลา</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link
                href={`/item/${item.id}`}
                key={item.id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative flex h-48 items-center justify-center bg-slate-100 overflow-hidden">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-6xl">🎒</span>
                  )}

                  <span
                    className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold ${
                      item.status === "RESOLVED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status === "RESOLVED" ? "ส่งคืนแล้ว" : "กำลังตามหา"}
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold text-red-500">{item.category}</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900 group-hover:text-red-600">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{item.description}</p>

                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <div>📍 {item.location}</div>
                    <div>📅 {new Date(item.created_at).toLocaleDateString("th-TH")}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}