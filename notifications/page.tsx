import Link from "next/link";
import Navbar from "@/components/Navbar";

const notifications = [
  {
    id: 1,
    icon: "🎉",
    title: "พบสิ่งของที่อาจตรงกับรายการของคุณ",
    message: "มีรายการ iPhone 13 Pro ที่มีข้อมูลใกล้เคียงกับของที่คุณแจ้งหาย",
    time: "10 นาทีที่แล้ว",
    type: "match",
    unread: true,
  },
  {
    id: 2,
    icon: "📦",
    title: "มีคำขอรับสิ่งของ",
    message: "มีผู้ใช้งานส่งคำขอรับกระเป๋าสตางค์ที่คุณแจ้งเป็นของพบ",
    time: "1 ชั่วโมงที่แล้ว",
    type: "claim",
    unread: true,
  },
  {
    id: 3,
    icon: "✅",
    title: "คำขอได้รับการอนุมัติ",
    message: "คำขอรับ AirPods ของคุณได้รับการอนุมัติแล้ว",
    time: "3 ชั่วโมงที่แล้ว",
    type: "success",
    unread: false,
  },
  {
    id: 4,
    icon: "🔔",
    title: "รายการของหายได้รับการอัปเดต",
    message: "สถานะรายการ iPhone 13 Pro ของคุณยังอยู่ระหว่างการตามหา",
    time: "เมื่อวาน",
    type: "info",
    unread: false,
  },
  {
    id: 5,
    icon: "⚠️",
    title: "แจ้งเตือนรายการ",
    message: "กรุณาตรวจสอบข้อมูลรายการเสื้อแจ็กเก็ตของคุณอีกครั้ง",
    time: "2 วันที่แล้ว",
    type: "warning",
    unread: false,
  },
];

export default function NotificationsPage() {
  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 px-6 py-16">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-black/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
            🔔 Notifications
          </span>

          <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-bold text-white md:text-5xl">
                การแจ้งเตือน
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-50">
                ติดตามข่าวสาร การอัปเดต และสถานะต่าง ๆ
                ที่เกี่ยวข้องกับรายการของคุณ
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 px-5 py-4 text-white backdrop-blur">
              <p className="text-sm text-blue-100">ยังไม่ได้อ่าน</p>
              <p className="mt-1 text-3xl font-bold">{unreadCount}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-6 py-10">

        {/* Filter */}
        <div className="-mt-20 relative flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <button className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">
            ทั้งหมด
          </button>

          <button className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-blue-50 hover:text-blue-600">
            ยังไม่ได้อ่าน
          </button>

          <button className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-blue-50 hover:text-blue-600">
            รายการของฉัน
          </button>

          <button className="ml-auto rounded-xl px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50">
            อ่านทั้งหมด
          </button>
        </div>

        {/* Header */}
        <div className="mt-10">
          <p className="text-sm font-semibold text-blue-600">
            NOTIFICATIONS
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            การแจ้งเตือนล่าสุด
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            มีการแจ้งเตือนทั้งหมด {notifications.length} รายการ
          </p>
        </div>

        {/* Notification List */}
        <div className="mt-6 space-y-3">

          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`group relative rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${
                notification.unread
                  ? "border-blue-100 bg-blue-50/50"
                  : "border-slate-200 bg-white"
              }`}
            >

              {notification.unread && (
                <div className="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-blue-600" />
              )}

              <div className="flex gap-4">

                {/* Icon */}
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                    notification.type === "match"
                      ? "bg-purple-100"
                      : notification.type === "claim"
                      ? "bg-orange-100"
                      : notification.type === "success"
                      ? "bg-emerald-100"
                      : notification.type === "warning"
                      ? "bg-amber-100"
                      : "bg-blue-100"
                  }`}
                >
                  {notification.icon}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pr-5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3
                      className={`font-bold ${
                        notification.unread
                          ? "text-slate-900"
                          : "text-slate-700"
                      }`}
                    >
                      {notification.title}
                    </h3>

                    <span className="shrink-0 text-xs text-slate-400">
                      {notification.time}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {notification.message}
                  </p>

                  <button className="mt-3 text-sm font-semibold text-blue-600 transition hover:text-blue-700">
                    ดูรายละเอียด →
                  </button>
                </div>

              </div>
            </div>
          ))}

        </div>

        {/* Empty CTA */}
        <div className="mt-10 rounded-3xl bg-slate-900 p-8 text-center md:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl">
            🔔
          </div>

          <h3 className="mt-4 text-2xl font-bold text-white">
            อย่าพลาดการแจ้งเตือนสำคัญ
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-slate-400">
            ตรวจสอบการแจ้งเตือนเป็นประจำ
            เพื่อเพิ่มโอกาสในการได้สิ่งของกลับคืน
          </p>

          <div className="mt-6 flex justify-center">
            <Link
              href="/my-reports"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-blue-50"
            >
              ดูรายการของฉัน
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-slate-400">
          🎒 Lost & Found University System
        </div>
      </footer>
    </div>
  );
}