import Link from "next/link";
import Navbar from "@/components/Navbar";

const claims = [
  {
    id: "1",
    item: "iPhone 13 Pro",
    claimant: "อารัตฎา ปิระซอ",
    studentId: "653xxxxxx",
    date: "7 ก.ย. 2569",
    status: "รอตรวจสอบ",
    icon: "📱",
  },
  {
    id: "2",
    item: "กระเป๋าสตางค์สีดำ",
    claimant: "มูฮัมหมัด อามีน",
    studentId: "653xxxxxx",
    date: "6 ก.ย. 2569",
    status: "อนุมัติแล้ว",
    icon: "👛",
  },
  {
    id: "3",
    item: "AirPods",
    claimant: "ฟาตีมะห์ ยูโซะ",
    studentId: "653xxxxxx",
    date: "5 ก.ย. 2569",
    status: "รอตรวจสอบ",
    icon: "🎧",
  },
  {
    id: "4",
    item: "บัตรนักศึกษา",
    claimant: "อับดุลเลาะห์ มะลี",
    studentId: "653xxxxxx",
    date: "4 ก.ย. 2569",
    status: "ไม่อนุมัติ",
    icon: "🎓",
  },
];

export default function AdminClaimsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 px-6 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-medium text-indigo-200">
            ADMIN / CLAIMS
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            จัดการคำร้องขอรับของคืน
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            ตรวจสอบข้อมูลและหลักฐานของผู้ที่ต้องการยืนยันความเป็นเจ้าของสิ่งของ
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">
              คำร้องทั้งหมด
            </p>
            <p className="mt-2 text-3xl font-black text-slate-900">
              32
            </p>
            <p className="mt-1 text-xs text-slate-400">
              คำร้อง
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">
              รอตรวจสอบ
            </p>
            <p className="mt-2 text-3xl font-black text-amber-500">
              8
            </p>
            <p className="mt-1 text-xs text-slate-400">
              คำร้อง
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">
              อนุมัติแล้ว
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-600">
              21
            </p>
            <p className="mt-1 text-xs text-slate-400">
              คำร้อง
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">
              ไม่อนุมัติ
            </p>
            <p className="mt-2 text-3xl font-black text-rose-600">
              3
            </p>
            <p className="mt-1 text-xs text-slate-400">
              คำร้อง
            </p>
          </div>
        </div>

        {/* Search / Filter */}
        <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex flex-1 gap-3">
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้ยื่นคำร้องหรือสิ่งของ..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <button className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700">
                ค้นหา
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
                ทั้งหมด
              </button>

              <button className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-600 hover:bg-amber-100">
                รอตรวจสอบ
              </button>

              <button className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-100">
                อนุมัติแล้ว
              </button>

              <button className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100">
                ไม่อนุมัติ
              </button>
            </div>
          </div>
        </div>

        {/* Claims */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">
              คำร้องขอรับของคืน
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              ตรวจสอบคำร้องและหลักฐานการเป็นเจ้าของ
            </p>
          </div>

          <div className="divide-y divide-slate-100">

            {claims.map((claim) => (
              <div
                key={claim.id}
                className="p-6 transition hover:bg-slate-50"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  {/* Claim information */}
                  <div className="flex items-start gap-4">

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                      {claim.icon}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="text-lg font-bold text-slate-900">
                          {claim.item}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            claim.status === "รอตรวจสอบ"
                              ? "bg-amber-100 text-amber-700"
                              : claim.status === "อนุมัติแล้ว"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {claim.status}
                        </span>

                      </div>

                      <div className="mt-2 space-y-1 text-sm text-slate-500">
                        <p>
                          👤 ผู้ยื่นคำร้อง:{" "}
                          <span className="font-medium text-slate-700">
                            {claim.claimant}
                          </span>
                        </p>

                        <p>
                          🎓 รหัสนิสิต: {claim.studentId}
                        </p>

                        <p>
                          📅 วันที่ยื่น: {claim.date}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap gap-2">

                    <Link
                      href={`/claims/${claim.id}`}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      ดูรายละเอียด
                    </Link>

                    {claim.status === "รอตรวจสอบ" && (
                      <>
                        <button className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                          ✓ อนุมัติ
                        </button>

                        <button className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700">
                          ✕ ปฏิเสธ
                        </button>
                      </>
                    )}

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
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
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