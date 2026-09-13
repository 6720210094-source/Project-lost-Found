import Image from "next/image";
import Link from "next/link";
import { BellRing, PackageSearch, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF0F3] to-[#FFE5EC] transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.85),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,185,200,0.25),_transparent_24%)]" />
      <div className="absolute -left-10 top-20 h-56 w-56 rounded-full bg-white/40 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[#F9A8D4]/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-6 lg:py-24">
        <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative z-10 max-w-xl text-slate-800 order-1">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F5D2D9] bg-white/80 px-3 py-2 text-xs font-semibold text-[#1F2937] shadow-[0_10px_20px_rgba(244,63,94,0.08)] backdrop-blur-sm sm:px-4 sm:text-sm">
              <Sparkles className="h-4 w-4 text-[#F43F5E]" />
              University Lost &amp; Found
            </div>

            <h1
              className="text-3xl font-extrabold leading-[1.08] tracking-[-0.045em] text-slate-900 sm:text-4xl md:text-5xl lg:text-[4rem] lg:leading-[1.08]"
              style={{ fontFamily: "var(--font-prompt)" }}
            >
              ถ้าของหาย
              <br />
              <span className="text-[#F43F5E]">ไม่ต้องใจหาย</span>
            </h1>

            <p className="mt-5 max-w-lg text-sm font-medium leading-7 text-[#334155] sm:text-base lg:text-lg lg:leading-8">
              ระบบแจ้งของหายและของพบภายในมหาวิทยาลัย ช่วยให้ผู้พบและเจ้าของสิ่งของ reconnect ได้ง่ายและรวดเร็ว
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/report-lost"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#F43F5E] px-5 py-3.5 text-base font-semibold text-white shadow-[0_16px_30px_rgba(244,63,94,0.25)] transition hover:-translate-y-0.5 hover:bg-[#E11D48] sm:w-auto"
              >
                <BellRing className="h-4 w-4" />
                แจ้งของหาย
              </Link>

              <Link
                href="/report-found"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#F8D7E0] bg-white/80 px-5 py-3.5 text-base font-semibold text-[#0F172A] shadow-[0_10px_25px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:bg-white sm:w-auto"
              >
                <PackageSearch className="h-4 w-4" />
                แจ้งของพบ
              </Link>
            </div>
          </div>

          <div className="relative flex items-center justify-center order-2 md:order-2">
            <div className="absolute h-72 w-72 rounded-full bg-[#FBCFE8]/60 blur-3xl sm:h-80 sm:w-80" />
            <div className="absolute h-56 w-56 rounded-full border border-white/60 bg-white/30 blur-2xl" />

            <div className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] border border-[#F7D9E3] bg-white/80 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm">
              <Image
                src="/images/hero-illustration.png"
                alt="Illustration of a guy returning a lost wallet"
                width={620}
                height={620}
                priority
                className="relative z-10 h-auto w-full drop-shadow-[0_28px_55px_rgba(244,63,94,0.18)] mix-blend-multiply"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
