"use client";

import { motion, AnimatePresence } from "framer-motion";
import { listVariants, listItemVariants } from "@/lib/animations";
import { RecordItem } from "./_components";
import { Each } from "react-flowify";

interface RecordListProps {
  records: {
    id: string;
    amount: number;
    giftType: string;
    memo: string | null;
    friend: { id: string; name: string; relation: string };
  }[];
  eventId: string;
}

export function RecordList({ records, eventId }: RecordListProps) {
  return (
    <Each
      items={records}
      renderEmpty={
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <motion.div
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-4xl mb-3"
          >
            📭
          </motion.div>
          <p className="text-sm text-muted-foreground">아직 기록된 내역이 없습니다</p>
          <p className="text-xs text-muted-foreground mt-1">
            위의 &apos;기록 추가&apos; 버튼을 눌러 추가해보세요
          </p>
        </motion.div>
      }
    >
      {(record) => (
        <motion.div
          key={record.id}
          variants={listItemVariants}
          layout
          exit="exit"
        >
          <RecordItem record={record} eventId={eventId} />
        </motion.div>
      )}
    </Each>
  );
}
