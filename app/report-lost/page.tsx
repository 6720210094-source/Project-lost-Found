"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function ReportLostPage() {
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
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `items/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("item-images")
          .upload(filePath, file);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("item-images")
            .getPublicUrl(filePath);
          imageUrl = publicUrlData.publicUrl;
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
          type: "LOST",
          status: "PENDING",
          user_id: user.id,
        },
      ]);

      if (insertError) {
        setErrorMsg(`เกิดข้อผิดพลาดในการบันทึก: ${insertError.message}`);
      } else {
        router.push("/lost");
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

      <section className="bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 px-6 py-14 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-100">
            Report Lost Item
          </p>
          <h1 className="mt-2 text-4xl font-bold md:text-5xl">แจ้งของหาย</h1>
          <p className="mt-4 max-w-2xl text-lg text-orange-100">
            กรอกข้อมูลสิ่งของที่หาย เพื่อให้ผู้ที่พบสามารถติดต่อคุณได้
          </p>
        </div>
      </section>

      <main className="px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">ข้อมูลสิ่งของ</h2>
              <p className="mt-1 text-sm text-slate-500">กรุณากรอกข้อมูลให้ครบถ้วน</p>
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
                  placeholder="เช่น iPhone 15 สีดำ"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-red-500"
                >
                  <option>อุปกรณ์อิเล็กทรอนิกส์</option>
                  <option>กระเป๋า</option>
                  <option>เอกสาร</option>
                  <option>เสื้อผ้า</option>
                  <option>ของใช้ส่วนตัว</option>
                  <option>อื่น ๆ</option>
                </select>
              </div>

              {/* สถานที่ */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  สถานที่ที่คาดว่าทำหาย *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="เช่น ห้องสมุด อาคารเรียนรวม โรงอาหาร"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              {/* รายละเอียด */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  รายละเอียดเพิ่มเติม
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ระบุสี ยี่ห้อ ลักษณะ หรือข้อมูลที่ช่วยระบุสิ่งของ..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              {/* รูปภาพ */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  รูปภาพสิ่งของ
                </label>
                <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center transition hover:border-red-400">
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
                href="/lost"
                className="rounded-xl border border-slate-200 px-6 py-3 text-center font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-red-500 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "กำลังส่งข้อมูล..." : "ส่งแจ้งของหาย"}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}