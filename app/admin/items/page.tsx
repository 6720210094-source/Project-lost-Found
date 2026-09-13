import Link from "next/link";
import Navbar from "@/components/Navbar";

const items = [
  {
    id: "1",
    name: "iPhone 13 Pro",
    type: "ของหาย",
    category: "อิเล็กทรอนิกส์",
    location: "อาคารเรียนรวม",
    date: "7 ก.ย. 2569",
    status: "รอตรวจสอบ",
    icon: "📱",
  },
  {
    id: "2",
    name: "กระเป๋าสตางค์สีดำ",
    type: "ของหาย",
    category: "ของใช้ส่วนตัว",
    location: "โรงอาหารมหาวิทยาลัย",
    date: "6 ก.ย. 2569",
    status: "อนุมัติแล้ว",
    icon: "👛",
  },
  {
    id: "3",
    name: "กุญแจรถยนต์",
    type: "ของพบ",
    category: "กุญแจ",
    location: "ลานจอดรถ",
    date: "5 ก.ย. 2569",
    status: "อนุมัติแล้ว",
    icon: "🔑",
  },
  {
    id: "4",
    name: "AirPods",
    type: "ของพบ",
    category: "อิเล็กทรอนิกส์",
    location: "ห้องสมุด",
    date: "4 ก.ย. 2569",
    status: "รอตรวจสอบ",
    icon: "🎧",
  },
  {
    id: "5",
    name: "เสื้อแจ็กเก็ตสีดำ",
    type: "ของหาย",
    category: "เสื้อผ้า",
    location: "อาคารวิทยาศาสตร์",
    date: "3 ก.ย. 2569",
    status: "ไม่อนุมัติ",
    icon: "🧥",
  },
  {
    id: "6",
    name: "บัตรนักศึกษา",
    type: "ของหาย",
    category: "เอกสาร",
    location: "หน้าหอสมุด",
    date: "2 ก.ย. 2569",
    status: "รอตรวจสอบ",
    icon: "🎓",
  },
];

export default function AdminItemsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-6 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-medium text-blue-200">
            ADMIN / ITEMS
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            จัดการรายการของหายและของพบ
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            ตรวจสอบ อนุมัติ แก้ไข และจัดการรายการที่ผู้ใช้งานแจ้งเข้ามาในระบบ
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">รายการทั้งหมด</p>
            <p className="mt-2 text-3xl font-black text-slate-900">128</p>
            <p className="mt-1 text-xs text-slate-400">
              รายการในระบบ
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">ของหาย</p>
            <p className="mt-2 text-3xl font-black text-rose-600">67</p>
            <p className="mt-1 text-xs text-slate-400">รายการ</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">ของพบ</p>
            <p className="mt-2 text-3xl font-black text-emerald-600">61</p>
            <p className="mt-1 text-xs text-slate-400">รายการ</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">รอตรวจสอบ</p>
            <p className="mt-2 text-3xl font-black text-amber-500">14</p>
            <p className="mt-1 text-xs text-slate-400">รายการ</p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex flex-1 gap-3">
              <input
                type="text"
                placeholder="ค้นหาชื่อสิ่งของ..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
                ค้นหา
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
                ทั้งหมด
              </button>

              <button className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100">
                ของหาย
              </button>

              <button className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-100">
                ของพบ
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">
              รายการทั้งหมด
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              ตรวจสอบและจัดการรายการที่แจ้งเข้ามา
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-6 transition hover:bg-slate-50"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  {/* Information */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                      {item.icon}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {item.name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            item.type === "ของหาย"
                              ? "bg-rose-100 text-rose-600"
                              : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>

                      <div className="mt-2 grid gap-1 text-sm text-slate-500 sm:grid-cols-2">
                        <span>📂 {item.category}</span>
                        <span>📍 {item.location}</span>
                        <span>📅 {item.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                    <span
                      className={`rounded-full px-4 py-2 text-center text-sm font-semibold ${
                        item.status === "รอตรวจสอบ"
                          ? "bg-amber-100 text-amber-700"
                          : item.status === "อนุมัติแล้ว"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>

                    <div className="flex flex-wrap gap-2">

                      <Link
                        href={`/item/${item.id}`}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        ดู
                      </Link>

                      <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                        แก้ไข
                      </button>

                      {item.status === "รอตรวจสอบ" && (
                        <>
                          <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                            อนุมัติ
                          </button>

                          <button className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                            ปฏิเสธ
                          </button>
                        </>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back */}
        <div className="mt-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
          >
            ← กลับ Dashboard
          </Link>
        </div>

      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-slate-500">
          Lost & Found University System · Admin Panel
        </div>
      </footer>
    </main>
  );
}