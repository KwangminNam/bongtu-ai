"use client";

import { useReducer } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { WelcomeLottie } from "@/components/lottie-animations";
import { LogScreen, LogClick } from "@/lib/logging";
import {
  introPageVariants,
  introStaggerVariants,
  itemVariants,
} from "@/lib/animations";

type Step = "welcome" | "login";
type Action = { type: "GO_LOGIN" };

function stepReducer(_state: Step, action: Action): Step {
  switch (action.type) {
    case "GO_LOGIN":
      return "login";
    default:
      return action.type satisfies never;
  }
}

export default function LoginPage() {
  const [step, dispatch] = useReducer(stepReducer, "welcome");

  return (
    <LogScreen>
      <div className="flex flex-col h-full px-8">
        <AnimatePresence mode="wait">
          {(() => {
            switch (step) {
              case "welcome":
                return <WelcomeStep onStart={() => dispatch({ type: "GO_LOGIN" })} />;
              case "login":
                return <LoginStep />;
              default:
                return step satisfies never;
            }
          })()}
        </AnimatePresence>
      </div>
    </LogScreen>
  );
}

function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      key="welcome"
      variants={introPageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col h-full"
    >
      {/* 상단: Lottie 애니메이션 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <WelcomeLottie size={200} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mt-4"
        >
          <h1 className="text-2xl font-bold">봉투AI</h1>
          <p className="text-sm text-muted-foreground mt-2">
            경조사 내역을 기록하고
            <br />
            AI가 경조사 내역을 분석하고 관리도 해드려요
          </p>
        </motion.div>
      </div>

      {/* 하단: CTA 버튼 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="pb-12"
      >
        <LogClick eventName="start_login">
          <Button
            className="w-full h-12 text-base font-medium"
            onClick={onStart}
          >
            로그인하고 시작하기
          </Button>
        </LogClick>
      </motion.div>
    </motion.div>
  );
}

function LoginStep() {
  return (
    <motion.div
      key="login"
      variants={introPageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col h-full"
    >
      {/* 상단 여백 + 로고 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center"
        >
          <span className="text-3xl text-primary-foreground font-bold">M</span>
        </motion.div>
        <h1 className="text-2xl font-bold">봉투AI</h1>
      </div>

      {/* 소셜 로그인 버튼 */}
      <motion.div
        variants={introStaggerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3 pb-12"
      >
        <motion.div variants={itemVariants}>
          <LogClick eventName="login_kakao">
            <Button
              className="w-full h-12 text-base font-medium bg-[#FEE500] text-[#191919] hover:bg-[#FDD800]"
              onClick={() => signIn("kakao", { callbackUrl: "/welcome" })}
            >
              <KakaoIcon />
              카카오로 시작하기
            </Button>
          </LogClick>
        </motion.div>
        <motion.p
          variants={itemVariants}
          className="text-xs text-muted-foreground text-center mt-2"
        >
          로그인 시 서비스 이용약관에 동의하게 됩니다
        </motion.p>
      </motion.div>
    </motion.div>
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
