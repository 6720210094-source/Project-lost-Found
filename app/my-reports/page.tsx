"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useState, useCallback } from "react";
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
}

export default function MyReportsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ทั้งหมด" | "ของหาย" | "ของพบ">("ทั้งหมด");
  const [search, setSearch] = useState("");

  const fetchMyReports = useCallback(async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReports(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchMyReports(user.id);
      } else {
        setLoading(false);
      }
    });
  }, [fetchMyReports]);

  const handleUpdateStatus = async (itemId: string, newStatus: string) => {
    const { error } = await supabase
      .from("items")
      .update({ status: newStatus })
      .eq("id", itemId);

    if (!error && user) {
      fetchMyReports(user.id);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) return;

    const { error } = await supabase.from("items").delete().eq("id", itemId);

    if (!error && user) {
      fetchMyReports(user.id);
    }
  };

  const filteredReports = reports.filter((item) => {
    const isLost = item.type === "LOST";
    const matchType =
      filter === "ทั้งหมด" ||
      (filter === "ของหาย" && isLost) ||
      (filter === "ของพบ" && !isLost);

    const keyword = search.toLowerCase();
    const matchSearch =
      item.title.toLowerCase().includes(keyword) ||
      item.category.toLowerCase().includes(keyword) ||
      item.location.toLowerCase().includes(keyword);

    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* HEADER */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-blue-600">MY REPORTS</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              รายการที่แจ้งไว้
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500 md:text-base">
              ตรวจสอบและจัดการรายการของหายและของพบของคุณ
            </p>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {!user ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-4xl">🔒</p>
            <h2 className="mt-4 text-xl font-bold text-slate-800">
              กรุณาเข้าสู่ระบบเพื่อดูรายการของคุณ
            </h2>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          <>
            {/* SUMMARY */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">รายการทั้งหมด</p>
                <p className="mt-2 text-3xl font-bold">{reports.length}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">ของหาย</p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {reports.filter((x) => x.type === "LOST").length}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">ของพบ</p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {reports.filter((x) => x.type === "FOUND").length}
                </p>
              </div>
            </div>

            {/* SEARCH & FILTER */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-md">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ค้นหาสิ่งของหรือสถานที่..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="flex gap-2">
                  {(["ทั้งหมด", "ของหาย", "ของพบ"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      className={
                        filter === item
                          ? "rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                          : "rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
                      }
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* LIST */}
            {loading ? (
              <div className="mt-12 text-center text-slate-500">กำลังโหลดรายการ...</div>
            ) : filteredReports.length === 0 ? (
              <div className="mt-6 rounded-xl border border-slate-200 bg-white py-16 text-center">
                <p className="text-4xl">🎒</p>
                <h3 className="mt-4 font-bold text-slate-700">ไม่พบรายการที่คุณแจ้งไว้</h3>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 overflow-hidden">
                          {report.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={report.image_url}
                              alt={report.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">{report.type === "LOST" ? "🎒" : "📦"}</span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                                report.type === "LOST"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {report.type === "LOST" ? "ของหาย" : "ของพบ"}
                            </span>

                            <span
                              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                                report.status === "RESOLVED"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {report.status === "RESOLVED" ? "ส่งคืนสำเร็จแล้ว" : "กำลังดำเนินการ"}
                            </span>
                          </div>

                          <h3 className="mt-2 text-lg font-bold text-slate-900">{report.title}</h3>
                          <p className="text-sm text-slate-500 mt-1">
                            📍 {report.location} • 📅 {new Date(report.created_at).toLocaleDateString("th-TH")}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {report.status !== "RESOLVED" && (
                          <button
                            onClick={() => handleUpdateStatus(report.id, "RESOLVED")}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            ✓ ทำรายการส่งคืนสำเร็จแล้ว
                          </button>
                        )}

                        <Link
                          href={`/item/${report.id}`}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          ดูรายละเอียด
                        </Link>

                        <button
                          onClick={() => handleDeleteItem(report.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          ลบรายการ
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}