"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

type AuthVariant = "login" | "register";

function InputField({
  label,
  type = "text",
  placeholder,
  icon,
  passwordToggle,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder: string;
  icon: React.ReactNode;
  passwordToggle?: { visible: boolean; onToggle: () => void };
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-left">
      <span className="mb-2 block text-sm font-medium text-[#1F2937]">{label}</span>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">{icon}</span>
        <input
          type={passwordToggle ? (passwordToggle.visible ? "text" : "password") : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-[48px] w-full rounded-full border border-[#E5E7EB] bg-[#F9FAFB] py-3.5 pl-12 pr-12 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#D1D5DB] focus:bg-white focus:ring-4 focus:ring-[#FDF2F8]"
        />
        {passwordToggle ? (
          <button
            type="button"
            onClick={passwordToggle.onToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] transition hover:text-[#111827]"
            aria-label="Toggle password visibility"
          >
            {passwordToggle.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
    </label>
  );
}

export default function AuthSplitCard({ variant }: { variant: AuthVariant }) {
  const isLogin = variant === "login";
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const titleThai = isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก";
  const titleEnglish = isLogin ? "Login" : "Sign Up";
  const subtitle = isLogin
    ? "เข้าสู่ระบบเพื่อติดตามสิ่งของที่หาย หรือแจ้งเบาะแสส่งคืนของที่พบ"
    : "สร้างบัญชีเพื่อร่วมเป็นส่วนหนึ่งของชุมชนตามหาของหายและส่งคืนสิ่งของที่ถูกพบ";
  const switchHref = isLogin ? "/register" : "/login";
  const switchLabel = isLogin ? "สมัครสมาชิก (SIGN UP)" : "เข้าสู่ระบบ (LOGIN)";
  const primaryButtonLabel = isLogin ? "เข้าสู่ระบบ (LOGIN) →" : "สมัครสมาชิก (SIGN UP) →";

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message.includes("Invalid login credentials") ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : error.message);
      } else if (data.session) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!fullName.trim()) {
      setErrorMsg("กรุณากรอกชื่อ-นามสกุล");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            name: fullName.trim(),
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      if (data.user) {
        const userProfile = {
          id: data.user.id,
          email: data.user.email ?? email.trim(),
          name: fullName.trim(),
          role: "USER",
        };

        const { error: userInsertError } = await supabase.from("users").upsert(userProfile, {
          onConflict: "id",
        });

        if (userInsertError) {
          console.error(
            "Insert user record failed:",
            userInsertError.message ?? JSON.stringify(userInsertError, null, 2)
          );
          setErrorMsg("สมัครสมาชิกสำเร็จแต่ไม่สามารถบันทึกข้อมูลผู้ใช้ได้ กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง");
          return;
        }
      }

      setSuccessMsg("สมัครสมาชิกสำเร็จแล้ว กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี");
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      if (data.session) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    if (isLogin) {
      void handleLogin(event);
      return;
    }
    void handleRegister(event);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] overflow-hidden rounded-[32px] border border-[#F1D6DD] bg-white shadow-[0_32px_90px_rgba(15,23,42,0.08)]">
      <div className="grid min-h-[auto] md:min-h-[740px] md:grid-cols-2">
        <section className="bg-white px-5 py-6 sm:px-8 sm:py-8 md:px-10 lg:px-14 lg:py-12">
          <div className="mx-auto flex h-full w-full max-w-[500px] flex-col justify-center">
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111827] text-lg font-bold text-white shadow-[0_10px_24px_rgba(17,24,39,0.16)]">
                LF
              </div>
              <div className="leading-tight">
                <p className="text-lg font-bold tracking-[-0.03em] text-[#111827]">FoundIt - Lost &amp; Found Hub</p>
                <p className="text-[11px] text-[#6B7280]">ระบบแจ้งและติดตามสิ่งของหายอัจฉริยะ</p>
              </div>
            </div>

            <div className="mb-7">
              <h1 className="text-3xl font-bold leading-tight text-[#111827] sm:text-[2.2rem]">
                <span className="block">{titleThai}</span>
                <span className="mt-1 block text-base font-medium tracking-[0.14em] text-[#9CA3AF] uppercase">
                  {titleEnglish}
                </span>
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#475569]">{subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg ? (
                <div className="rounded-full border border-[#F9C8D4] bg-[#FFF7FA] px-4 py-3 text-sm text-[#B42359]">
                  {errorMsg}
                </div>
              ) : null}

              {successMsg ? (
                <div className="rounded-full border border-[#C7F0D6] bg-[#F1FFF7] px-4 py-3 text-sm text-[#166534]">
                  {successMsg}
                </div>
              ) : null}

              {!isLogin ? (
                <InputField
                  label="ชื่อ-นามสกุล (Full Name)"
                  placeholder="กรอกชื่อของคุณ"
                  icon={<UserRound className="h-4 w-4" />}
                  value={fullName}
                  onChange={setFullName}
                />
              ) : null}

              <InputField
                label="อีเมลบัญชีผู้ใช้ (Email Address)"
                type="email"
                placeholder="อีเมลที่ลงทะเบียนไว้ เช่น yourname@domain.com"
                icon={<Mail className="h-4 w-4" />}
                value={email}
                onChange={setEmail}
              />

              <div className="space-y-2">
                <InputField
                  label="รหัสผ่าน (Password)"
                  placeholder="••••••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  passwordToggle={{ visible: showPassword, onToggle: () => setShowPassword((prev) => !prev) }}
                  value={password}
                  onChange={setPassword}
                />

                {isLogin ? (
                  <div className="text-right">
                    <Link href="/" className="text-sm font-medium text-[#475569] transition hover:text-[#111827]">
                      ลืมรหัสผ่าน? (Forgot Password)
                    </Link>
                  </div>
                ) : null}
              </div>

              {!isLogin ? (
                <InputField
                  label="ยืนยันรหัสผ่าน (Confirm Password)"
                  placeholder="••••••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  passwordToggle={{ visible: showConfirmPassword, onToggle: () => setShowConfirmPassword((prev) => !prev) }}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex min-h-[48px] w-full items-center justify-center gap-3 rounded-full bg-[#1A1A1A] px-5 py-3.5 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#111111] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>{loading ? (isLogin ? "กำลังเข้าสู่ระบบ..." : "กำลังสมัครสมาชิก...") : primaryButtonLabel}</span>
              </button>
            </form>

            <div className="mt-8 border-t border-[#F3F4F6] pt-5 text-center text-sm text-[#6B7280]">
              <p>© 2026 FoundIt - ระบบติดตามและส่งคืนของหาย</p>
              <div className="mt-2 flex items-center justify-center gap-5 text-[#475569]">
                <Link href="/" className="transition hover:text-[#111827]">
                  ช่วยเหลือ
                </Link>
                <Link href="/" className="transition hover:text-[#111827]">
                  ความปลอดภัย
                </Link>
              </div>
            </div>
          </div>
        </section>

        <aside className="relative order-2 min-h-[260px] overflow-hidden bg-[#0F172A] md:order-none md:min-h-[340px]">
          <Image
            src="https://png.pngtree.com/thumb_back/fh260/background/20220701/pngtree-office-desk-of-an-engineer-adorned-with-assorted-tools-and-paperworks-photo-image_47424972.jpg"
            alt="Lost & Found illustration"
            fill
            unoptimized
            className="object-cover brightness-50"
          />

          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 flex h-full items-center justify-center p-6 sm:p-8 md:p-10 lg:p-12">
            <div className="max-w-[440px] text-center text-white">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-xs font-medium text-white/90 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-[#F43F5E]" />
                ระบบค้นหาและส่งคืนของหาย (Smart Recovery)
              </div>

              <h2 className="text-3xl font-bold leading-tight tracking-[-0.04em] text-white sm:text-[2.6rem]">
                ทำของหาย หรือพบของตกหล่น?
              </h2>

              <p className="mt-5 text-base leading-7 text-white/85">
                ลงทะเบียนเพื่อร่วมเป็นส่วนหนึ่งของคอมมูนิตี้ตามหาของหาย แจ้งเบาะแส และส่งมอบของสำคัญคืนสู่มือเจ้าของอย่างปลอดภัย
              </p>

              <div className="mt-8 flex justify-center">
                <Link
                  href={switchHref}
                  className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
                >
                  {switchLabel}
                </Link>
              </div>

              <div className="mt-8 rounded-full border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white/90 backdrop-blur-sm">
                ช่วยส่งคืนของสำคัญสู่มือเจ้าของแล้วกว่า 50,000+ ชิ้น ปลอดภัย 100%
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
