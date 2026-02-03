"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/lib/api";

const TYPE_LABEL: Record<string, string> = {
  WEDDING: "결혼",
  FUNERAL: "장례",
  BIRTHDAY: "생일/잔치",
  ETC: "기타",
};

const TYPE_EMOJI: Record<string, string> = {
  WEDDING: "💒",
  FUNERAL: "🕯️",
  BIRTHDAY: "🎂",
  ETC: "🎉",
};

const TYPE_GRADIENT: Record<string, string> = {
  WEDDING: "from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30",
  FUNERAL: "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30",
  BIRTHDAY: "from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30",
  ETC: "from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

export function EventList({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-6xl mb-4"
        >
          📋
        </motion.div>
        <p className="text-muted-foreground font-medium">아직 등록된 이벤트가 없어요</p>
        <p className="text-sm text-muted-foreground mt-1">새 이벤트를 등록해보세요!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-3"
    >
      {events.map((event, index) => {
        const totalAmount = event.records.reduce((sum, r) => sum + r.amount, 0);
        return (
          <motion.div key={event.id} variants={itemVariants}>
            <Link href={`/dashboard/events/${event.id}`}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Card className={`p-4 bg-gradient-to-r ${TYPE_GRADIENT[event.type] || TYPE_GRADIENT.ETC} border-0 shadow-sm hover:shadow-lg transition-shadow overflow-hidden relative`}>
                  {/* 배경 장식 */}
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                    <span className="text-7xl">{TYPE_EMOJI[event.type] || "🎉"}</span>
                  </div>

                  <div className="flex items-center justify-between relative">
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                        className="w-11 h-11 rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-sm flex items-center justify-center"
                      >
                        <span className="text-xl">{TYPE_EMOJI[event.type] || "🎉"}</span>
                      </motion.div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{event.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px] font-normal">
                            {TYPE_LABEL[event.type] || event.type}
                          </Badge>
                          <span>
                            {new Date(event.date).toLocaleDateString("ko-KR", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span>·</span>
                          <span>{event.records.length}명</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-bold">
                          {totalAmount.toLocaleString()}
                          <span className="text-xs font-normal ml-0.5">원</span>
                        </div>
                      </div>
                      <motion.div
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ChevronRight size={18} className="text-muted-foreground" />
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
