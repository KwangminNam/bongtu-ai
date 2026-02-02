"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-dvh px-8">
      {/* 상단 여백 + 로고 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
          <span className="text-3xl text-primary-foreground font-bold">M</span>
        </div>
        <h1 className="text-2xl font-bold">마음장부</h1>
        <p className="text-sm text-muted-foreground text-center">
          경조사 내역을 기록하고
          <br />
          AI가 적정 금액을 제안해드려요
        </p>
      </div>

      {/* 소셜 로그인 버튼 영역 */}
      <div className="flex flex-col gap-3 pb-12">
        <Button
          className="w-full h-12 text-base font-medium bg-[#FEE500] text-[#191919] hover:bg-[#FDD800]"
          onClick={() => signIn("kakao", { callbackUrl: "/dashboard" })}
        >
          <KakaoIcon />
          카카오로 시작하기
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 text-base font-medium"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          <GoogleIcon />
          Google로 시작하기
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          로그인 시 서비스 이용약관에 동의하게 됩니다
        </p>
      </div>
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="mr-2">
      <path
        fill="#191919"
        d="M9 1C4.58 1 1 3.79 1 7.21c0 2.17 1.45 4.08 3.64 5.18-.16.57-.58 2.07-.67 2.39-.1.4.15.39.31.28.13-.08 2.04-1.38 2.87-1.94.6.09 1.22.13 1.85.13 4.42 0 8-2.79 8-6.24C17 3.79 13.42 1 9 1"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="mr-2">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 01-1.8 2.71v2.26h2.92A8.78 8.78 0 0017.64 9.2z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A8.99 8.99 0 009 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71A5.41 5.41 0 013.68 9c0-.59.1-1.17.29-1.71V4.96H.96A8.99 8.99 0 000 9c0 1.45.35 2.82.96 4.04l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A8.99 8.99 0 00.96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
