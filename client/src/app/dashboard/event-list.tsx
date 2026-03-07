"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogScreen } from "@/lib/logging";
import { Each } from "react-flowify";
import type { Event } from "@/lib/api";
import { EVENT_TYPE_LABELS, EVENT_TYPE_EMOJIS, EVENT_TYPE_GRADIENTS } from "@/lib/constants";

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
  return (
    <LogScreen params={{ eventCount: events.length }}>
      <Each
        items={events}
        renderEmpty={
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
        }
      >
        {(event, { index }) => {
          const records = event.records ?? [];
          const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-3"
            >
              <motion.div key={event.id} variants={itemVariants}>
                <Link href={`/dashboard/events/${event.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Card className={`p-4 bg-gradient-to-r ${EVENT_TYPE_GRADIENTS[event.type] || EVENT_TYPE_GRADIENTS.ETC} border-0 shadow-sm hover:shadow-lg transition-shadow overflow-hidden relative`}>
                      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                        <span className="text-7xl">{EVENT_TYPE_EMOJIS[event.type] || "🎉"}</span>
                      </div>
                      <div className="flex items-center justify-between relative">
                        <div className="flex items-center gap-3">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                            className="w-11 h-11 rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-sm flex items-center justify-center"
                          >
                            <span className="text-xl">{EVENT_TYPE_EMOJIS[event.type] || "🎉"}</span>
                          </motion.div>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{event.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px] font-normal">
                                {EVENT_TYPE_LABELS[event.type] || event.type}
                              </Badge>
                              <span>
                                {new Date(event.date).toLocaleDateString("ko-KR", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span>·</span>
                              <span>{records.length}명</span>
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
            </motion.div>
          );
        }}
      </Each>
    </LogScreen>
  );
}
