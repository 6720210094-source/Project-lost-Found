import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
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
    <html lang="th" suppressHydrationWarning data-scroll-behavior="smooth" className="light">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                document.documentElement.style.colorScheme = 'light';
                localStorage.setItem('lost-found-theme', 'light');
              } catch (error) {
                document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme = 'light';
              }
            `,
          }}
        />
      </head>
      <body className={`${prompt.variable} min-h-screen bg-[#FFF7F9] text-[#2A2D43] antialiased transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} themes={['light']} storageKey="lost-found-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}