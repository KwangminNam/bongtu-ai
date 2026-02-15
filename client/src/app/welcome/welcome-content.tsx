"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { OnboardingLottie } from "@/components/lottie-animations";
import { LogScreen } from "@/lib/logging";
import { itemVariants } from "@/lib/animations";

const AUTO_REDIRECT_MS = 2000;

export function WelcomeContent({ hasEvents }: { hasEvents: boolean }) {
  const router = useRouter();

  useEffect(() => {
    const destination = hasEvents ? "/dashboard/chat" : "/dashboard/events/new";
    const timer = setTimeout(() => router.push(destination), AUTO_REDIRECT_MS);
    return () => clearTimeout(timer);
  }, [hasEvents, router]);

  return (
    <LogScreen params={{ hasEvents }}>
      {hasEvents ? <ReturningUserView /> : <NewUserView />}
    </LogScreen>
  );
}

function ReturningUserView() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4"
        >
          <span className="text-3xl text-primary-foreground font-bold">M</span>
        </motion.div>
        <h1 className="text-2xl font-bold">다시 만나서 반가워요!</h1>
        <p className="text-sm text-muted-foreground mt-2">
          잠시 후 이동합니다...
        </p>
      </motion.div>
    </div>
  );
}

function NewUserView() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <OnboardingLottie size={160} />

        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="text-center mt-6"
        >
          <h1 className="text-2xl font-bold">환영합니다!</h1>
          <p className="text-sm text-muted-foreground mt-2">
            첫 번째 경조사를 등록해보세요
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-6 w-full max-w-xs rounded-xl border bg-card p-4 shadow-sm"
        >
          <p className="text-sm text-muted-foreground text-center">
            이벤트를 등록하면
            <br />
            AI가 적정 금액을 제안해드려요
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-muted-foreground mt-4"
        >
          잠시 후 이동합니다...
        </motion.p>
      </motion.div>
    </div>
  );
}
