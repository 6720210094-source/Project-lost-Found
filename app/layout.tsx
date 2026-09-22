import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lost & Found",
  description: "ระบบแจ้งของหายและของพบภายในมหาวิทยาลัย",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className="light"
    >
      <body
        className={`${prompt.variable} min-h-screen bg-[#FFF7F9] text-[#2A2D43] antialiased transition-colors duration-300`}
      >
{children}
      </body>
    </html>
  );
}
