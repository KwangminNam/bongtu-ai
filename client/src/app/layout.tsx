import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "마음장부",
  description: "경조사 내역 관리 및 AI 적정 금액 제안 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-muted flex justify-center`}
      >
        <Providers>
          <div className="w-[393px] min-h-dvh bg-background shadow-xl relative overflow-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
