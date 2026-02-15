import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
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
  metadataBase: new URL("https://bongtu-ai.vercel.app"),
  title: {
    default: "봉투AI",
    template: "%s | 봉투AI",
  },
  description: "경조사 내역 관리 및 AI 적정 금액 제안 서비스",
  keywords: ["경조사", "축의금", "부의금", "경조사 관리", "AI 금액 제안"],
  authors: [{ name: "봉투AI" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "봉투AI",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-muted flex justify-center items-center h-dvh overflow-hidden`}
      >
        <Providers>
          <div className="w-full max-w-[393px] h-[852px] max-h-dvh bg-background shadow-xl relative overflow-hidden touch-pan-y overscroll-contain">
            {children}
          </div>
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
