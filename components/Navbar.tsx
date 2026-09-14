"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const menuItems = [
  { href: "/", label: "แดชบอร์ด" },
  { href: "/lost", label: "ของหาย" },
  { href: "/found", label: "ของพบ" },
];

const reportItems = [
  { href: "/report-lost", label: "แจ้งของหาย", highlight: true },
  { href: "/report-found", label: "แจ้งของพบ", highlight: true },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setTheme("light");
    localStorage.setItem("lost-found-theme", "light");

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setTheme]);

  useEffect(() => {
    async function fetchUnreadChatCount() {
      if (!user) {
        setChatUnreadCount(0);
        return;
      }

      const { data: rooms, error } = await supabase
        .from("chat_rooms")
        .select("id, user1_id, user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (error || !rooms) {
        setChatUnreadCount(0);
        return;
      }

      let unreadCount = 0;

      for (const room of rooms) {
        const lastSeenAt = localStorage.getItem(`chat-last-seen-${room.id}`);
        const { data: messages, error: messagesError } = await supabase
          .from("chat_messages")
          .select("id, sender_id, created_at")
          .eq("room_id", room.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (messagesError || !messages) continue;

        const unseenMessages = messages.filter((message) => {
          if (message.sender_id === user.id) return false;
          if (!lastSeenAt) return true;
          return new Date(message.created_at).getTime() > new Date(lastSeenAt).getTime();
        });

        unreadCount += unseenMessages.length;
      }

      setChatUnreadCount(unreadCount);
    }

    fetchUnreadChatCount();
  }, [user, pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-rose-100 bg-white/90 backdrop-blur-md transition-colors duration-300">
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        <Link href="/" className="group flex items-center gap-3 transition-transform duration-200 hover:scale-[1.05]" aria-label="Go to homepage">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-rose-100 bg-rose-50 shadow-[0_8px_18px_rgba(244,63,94,0.08)] sm:h-10 sm:w-10">
            <Image
              src="https://png.pngtree.com/png-vector/20251022/ourmid/pngtree-lost-and-found-sign-with-down-arrow-vector-png-image_17791219.webp"
              alt="Lost and Found logo"
              width={40}
              height={40}
              unoptimized
              className="h-full w-full object-cover"
            />
          </div>
          <p className="text-sm font-extrabold tracking-[-0.02em] text-slate-900 transition-colors duration-200 group-hover:text-[#F43F5E] sm:text-base">
            Lost &amp; Found
          </p>
        </Link>

        <div className="hidden items-center gap-1.5 md:flex">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-all ${
                isActive(item.href)
                  ? "bg-[color:var(--primary-soft)] text-[color:var(--primary)] shadow-sm"
                  : "text-slate-700 hover:bg-[color:var(--primary-soft)] hover:text-[color:var(--primary)]"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {reportItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                item.highlight
                  ? "bg-[color:var(--primary)] text-white shadow-[0_12px_28px_rgba(225,29,72,0.22)] hover:-translate-y-0.5 hover:bg-[color:var(--primary-hover)]"
                  : "text-slate-700 hover:bg-[color:var(--primary-soft)] hover:text-[color:var(--primary)]"
              }`}
            >
              <span className="text-base leading-none">＋</span>
              <span>{item.label}</span>
            </Link>
          ))}

          {user && (
            <Link
              href="/my-chats"
              className={`relative inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-all ${
                isActive("/my-chats")
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              💬 ห้องแชท
              {chatUnreadCount > 0 && (
                <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {chatUnreadCount}
                </span>
              )}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/my-reports"
                className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-all ${
                  isActive("/my-reports")
                    ? "bg-[color:var(--primary-soft)] text-[color:var(--primary)]"
                    : "text-slate-700 hover:bg-[color:var(--primary-soft)] hover:text-[color:var(--primary)]"
                }`}
              >
                รายการของฉัน
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-[color:var(--panel-border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--primary)] transition hover:border-[color:var(--primary)] hover:bg-[color:var(--primary-soft)]"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(225,29,72,0.22)] transition hover:-translate-y-0.5 hover:bg-[color:var(--primary-hover)] md:inline-flex"
            >
              เข้าสู่ระบบ
            </Link>
          )}

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--panel-border)] bg-[color:var(--surface)] text-lg text-[color:var(--text-primary)] shadow-sm md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-rose-100 bg-white/90 px-6 py-4 shadow-sm backdrop-blur-md transition-colors duration-300 md:hidden">
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  isActive(item.href)
                    ? "bg-[color:var(--primary-soft)] text-[color:var(--primary)]"
                    : "text-[color:var(--text-secondary)] hover:text-[color:var(--primary)]"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {reportItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full bg-[color:var(--primary)] px-3 py-2 text-sm font-semibold text-white"
              >
                ＋ {item.label}
              </Link>
            ))}

            {user && (
              <Link
                href="/my-chats"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700"
              >
                <span>💬 ห้องแชท</span>
                {chatUnreadCount > 0 && (
                  <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {chatUnreadCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="mt-2 rounded-full border border-[color:var(--panel-border)] bg-[color:var(--surface)] px-3 py-2 text-sm font-medium text-[color:var(--primary)]"
              >
                ออกจากระบบ
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 rounded-full bg-[color:var(--primary)] px-3 py-2 text-center text-sm font-semibold text-white"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}