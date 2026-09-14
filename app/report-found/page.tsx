"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import ItemImage from "@/components/ItemImage";

export default function ReportFoundPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("อุปกรณ์อิเล็กทรอนิกส์");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg("กรุณาเข้าสู่ระบบก่อนทำการแจ้งรายการ");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Ensure user exists in public.users to satisfy foreign key constraint
      await supabase.from("users").upsert(
        [
          {
            id: user.id,
            email: user.email || "",
            password_hash: "supabase_auth",
            name: user.user_metadata?.name || user.email?.split("@")[0] || "ผู้ใช้งาน",
            phone: user.user_metadata?.phone || "",
            role: "USER",
          },
        ],
        { onConflict: "id" }
      );

      // 2. Upload image if present
      let imageUrl = "";

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const result = await uploadResponse.json();
          imageUrl = result.url || "";
        } else {
          const result = await uploadResponse.json().catch(() => ({}));
          throw new Error(result.error || "ไม่สามารถอัปโหลดรูปภาพได้");
        }
      }

      // 3. Insert item
      const { error: insertError } = await supabase.from("items").insert([
        {
          title,
          category,
          location,
          description,
          image_url: imageUrl || null,
          type: "FOUND",
          status: "PENDING",
          user_id: user.id,
        },
      ]);

      if (insertError) {
        setErrorMsg(`เกิดข้อผิดพลาดในการบันทึก: ${insertError.message}`);
      } else {
        router.push("/found");
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 px-6 py-14 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-100">
            Report Found Item
          </p>
          <h1 className="mt-2 text-4xl font-bold md:text-5xl">แจ้งของพบ</h1>
          <p className="mt-4 max-w-2xl text-lg text-emerald-100">
            หากคุณพบสิ่งของภายในมหาวิทยาลัย สามารถแจ้งข้อมูลไว้ที่นี่เพื่อช่วยส่งคืนเจ้าของ
          </p>
        </div>
      </section>

      <main className="px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">ข้อมูลสิ่งของที่พบ</h2>
              <p className="mt-1 text-sm text-slate-500">
                กรุณาระบุข้อมูลให้ละเอียด เพื่อช่วยให้เจ้าของค้นหาได้ง่ายขึ้น
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">

              {/* ชื่อสิ่งของ */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  ชื่อสิ่งของ *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น โทรศัพท์ iPhone สีดำ"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* หมวดหมู่ */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  หมวดหมู่ *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                >
                  <option>อุปกรณ์อิเล็กทรอนิกส์</option>
                  <option>กระเป๋า</option>
                  <option>เอกสาร</option>
                  <option>เสื้อผ้า</option>
                  <option>ของใช้ส่วนตัว</option>
                  <option>อื่น ๆ</option>
                </select>
              </div>

              {/* สถานที่พบ */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  สถานที่พบ *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="เช่น ห้องสมุด อาคารเรียนรวม โรงอาหาร"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* รายละเอียด */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  รายละเอียดสิ่งของ
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ระบุสี ยี่ห้อ ลักษณะ หรือรายละเอียดอื่น ๆ..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* รูปภาพ */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  รูปภาพสิ่งของ
                </label>
                <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center transition hover:border-emerald-400">
                  <div className="text-4xl">📷</div>
                  <p className="mt-2 font-medium text-slate-700">เลือกรูปภาพเพื่ออัปโหลด</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="mx-auto mt-3 block text-sm text-slate-500"
                  />
                </div>
              </div>

            </div>

            {/* ปุ่ม */}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/found"
                className="rounded-xl border border-slate-200 px-6 py-3 text-center font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-600 disabled:opacity-50"
              >
                {loading ? "กำลังส่งข้อมูล..." : "ส่งแจ้งของพบ"}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}