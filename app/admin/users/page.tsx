
import Link from "next/link";
import Navbar from "@/components/Navbar";

const users = [
  {
    id: "1",
    name: "อารัตฎา ปิระซอ",
    studentId: "653xxxxxx",
    email: "aratda@example.com",
    role: "ผู้ใช้งาน",
    status: "ใช้งานอยู่",
    reports: 5,
  },
  {
    id: "2",
    name: "มูฮัมหมัด อามีน",
    studentId: "653xxxxxx",
    email: "amin@example.com",
    role: "ผู้ใช้งาน",
    status: "ใช้งานอยู่",
    reports: 3,
  },
  {
    id: "3",
    name: "ฟาตีมะห์ ยูโซะ",
    studentId: "653xxxxxx",
    email: "fatimah@example.com",
    role: "ผู้ใช้งาน",
    status: "ใช้งานอยู่",
    reports: 7,
  },
  {
    id: "4",
    name: "ผู้ดูแลระบบ",
    studentId: "-",
    email: "admin@example.com",
    role: "ผู้ดูแลระบบ",
    status: "ใช้งานอยู่",
    reports: 12,
  },
  {
    id: "5",
    name: "อับดุลเลาะห์ มะลี",
    studentId: "653xxxxxx",
    email: "abdullah@example.com",
    role: "ผู้ใช้งาน",
    status: "ระงับ",
    reports: 1,
  },
];

export default function AdminUsersPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 px-6 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-medium text-cyan-200">
            ADMIN / USERS
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            จัดการผู้ใช้งาน
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            ตรวจสอบข้อมูลผู้ใช้งาน จัดการสิทธิ์ และสถานะบัญชีภายในระบบ
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">ผู้ใช้งานทั้งหมด</p>
            <p className="mt-2 text-3xl font-black text-slate-900">256</p>
            <p className="mt-1 text-xs text-slate-400">บัญชี</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">กำลังใช้งาน</p>
            <p className="mt-2 text-3xl font-black text-emerald-600">
              248
            </p>
            <p className="mt-1 text-xs text-slate-400">บัญชี</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">ระงับบัญชี</p>
            <p className="mt-2 text-3xl font-black text-rose-600">7</p>
            <p className="mt-1 text-xs text-slate-400">บัญชี</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">ผู้ดูแลระบบ</p>
            <p className="mt-2 text-3xl font-black text-blue-600">1</p>
            <p className="mt-1 text-xs text-slate-400">บัญชี</p>
          </div>

        </div>

        <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex flex-1 gap-3">
              <input
                type="text"
                placeholder="ค้นหาชื่อ รหัสนิสิต หรืออีเมล..."
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

              <button className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-100">
                ใช้งานอยู่
              </button>

              <button className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100">
                ระงับ
              </button>

            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">
              รายชื่อผู้ใช้งาน
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              ตรวจสอบและจัดการบัญชีผู้ใช้งานในระบบ
            </p>
          </div>

          <div className="divide-y divide-slate-100">

            {users.map((user) => (
              <div
                key={user.id}
                className="p-6 transition hover:bg-slate-50"
              >

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div className="flex items-start gap-4">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl">
                      👤
                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="text-lg font-bold text-slate-900">
                          {user.name}
                        </h3>

                        <span
                          className={
                            user.role === "ผู้ดูแลระบบ"
                              ? "rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700"
                              : "rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700"
                          }
                        >
                          {user.role}
                        </span>

                        <span
                          className={
                            user.status === "ใช้งานอยู่"
                              ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
                              : "rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700"
                          }
                        >
                          {user.status}
                        </span>

                      </div>

                      <div className="mt-2 grid gap-1 text-sm text-slate-500 sm:grid-cols-2">

                        <span>
                          🎓 รหัสนิสิต: {user.studentId}
                        </span>

                        <span>
                          ✉️ {user.email}
                        </span>

                        <span>
                          📋 รายงานทั้งหมด: {user.reports} รายการ
                        </span>

                      </div>

                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">

                    <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                      ดูข้อมูล
                    </button>

                    <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                      แก้ไข
                    </button>

                    {user.status === "ใช้งานอยู่" &&
                      user.role !== "ผู้ดูแลระบบ" && (
                        <button className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">
                          ระงับ
                        </button>
                      )}

                    {user.status === "ระงับ" && (
                      <button className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
                        เปิดใช้งาน
                      </button>
                    )}

                  </div>

                </div>

              </div>
            ))}

          </div>
        </div>

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

