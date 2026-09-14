"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ItemImage from "@/components/ItemImage";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
}

export default function Home() {
  const [lostCount, setLostCount] = useState(0);
  const [foundCount, setFoundCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchStats() {
      const { count: lCount } = await supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("type", "LOST");
      setLostCount(lCount || 0);

      const { count: fCount } = await supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("type", "FOUND");
      setFoundCount(fCount || 0);

      const { count: pCount } = await supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("status", "PENDING");
      setPendingCount(pCount || 0);

      const { count: rCount } = await supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("status", "RESOLVED");
      setResolvedCount(rCount || 0);

      const { data } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      if (data) setRecentItems(data);
    }

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[color:var(--text-secondary)] transition-colors duration-300">
      <Navbar />

      <HeroSection />

      <section className="relative z-10 mx-auto -mt-8 max-w-5xl px-6">
        <div className="rounded-[24px] border border-[#F6D9DF] bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-colors duration-300">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-bold text-[#0F172A]">
                🔎 ค้นหาสิ่งของ
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="เช่น iPhone, กระเป๋าสตางค์, กุญแจ..."
                className="w-full rounded-2xl border border-[#F3D9DF] bg-[#FFFDFD] px-5 py-3.5 text-[#0F172A] outline-none transition focus:border-[#E11D48]/60 focus:bg-white focus:shadow-[0_0_0_4px_rgba(225,29,72,0.08)] placeholder:text-slate-500"
              />
            </div>
            <Link
              href={`/lost?search=${encodeURIComponent(searchQuery)}`}
              className="rounded-full bg-[#E11D48] px-8 py-3.5 text-center font-bold text-white shadow-[0_12px_30px_rgba(225,29,72,0.2)] transition hover:-translate-y-0.5 hover:bg-[#BE123C]"
            >
              ค้นหา
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8 pt-16">
        <div className="mb-7">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#E11D48]">System Overview</p>
          <h2 className="mt-2 text-3xl font-extrabold text-[#0F172A]">ภาพรวมการใช้งาน</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon="🔍" title="ของหาย" value={lostCount} description="รายการทั้งหมด" bg="bg-[#FFF5F6]" />
          <StatCard icon="📦" title="ของพบ" value={foundCount} description="รายการทั้งหมด" bg="bg-[#FFF9F1]" />
          <StatCard icon="⏳" title="กำลังดำเนินการ" value={pendingCount} description="รอการจับคู่" bg="bg-[#FFF1F2]" />
          <StatCard icon="✅" title="ส่งคืนสำเร็จ" value={resolvedCount} description="รายการที่คืนแล้ว" bg="bg-[#FEE2E2]" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#E11D48]">Recent Items</p>
            <h2 className="mt-2 text-3xl font-bold text-[#0F172A]">รายการล่าสุด</h2>
          </div>
          <Link href="/lost" className="font-semibold text-[#E11D48] transition hover:text-[#BE123C]">
            ดูทั้งหมด →
          </Link>
        </div>

        {recentItems.length === 0 ? (
          <div className="rounded-[24px] border border-[#F3D9DF] bg-white p-12 text-center text-slate-600 shadow-sm transition-colors duration-300">
            ยังไม่มีรายการล่าสุดในระบบ
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentItems.map((item) => (
              <Link
                key={item.id}
                href={`/item/${item.id}`}
                className="group overflow-hidden rounded-[24px] border border-[#F3D9DF] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(225,29,72,0.08)]"
              >
                <div className="flex h-44 items-center justify-center overflow-hidden bg-[#F8FAFC]">
                  {item.image_url ? (
                    <ItemImage
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">{item.type === "LOST" ? "🎒" : "📦"}</span>
                  )}
                </div>
                <div className="p-5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.type === "LOST" ? "bg-[#FFE4E6] text-[#BE123C]" : "bg-[#DCFCE7] text-[#15803D]"
                    }`}
                  >
                    {item.type === "LOST" ? "ของหาย" : "ของพบ"}
                  </span>
                  <h3 className="mt-2 text-lg font-extrabold text-[#0F172A] group-hover:text-[#E11D48]">{item.title}</h3>
                  <p className="mt-1 text-xs font-medium text-slate-600">📍 {item.location}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-16 border-t border-[#F6D9DF] bg-white/80 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm font-medium text-slate-600">
          🎒 Lost &amp; Found University System
        </div>
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  description,
  bg,
}: {
  icon: string;
  title: string;
  value: number;
  description: string;
  bg: string;
}) {
  return (
    <div className={`rounded-[24px] border border-[#F3D9DF] p-6 shadow-[0_12px_28px_rgba(15,23,42,0.03)] transition-colors duration-300 ${bg}`}>
      <div className="text-3xl">{icon}</div>
      <p className="mt-3 text-sm font-bold text-slate-700">{title}</p>
      <p className="mt-1 text-3xl font-extrabold text-[#0F172A]">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{description}</p>
    </div>
  );
}