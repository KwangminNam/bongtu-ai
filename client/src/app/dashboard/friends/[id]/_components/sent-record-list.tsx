"use client";

import { SentRecordItem } from "./sent-record-item";
import { Each } from "react-flowify";
import type { SentRecord } from "@/lib/api";

interface SentRecordListProps {
  records: SentRecord[];
  friendId: string;
}

export function SentRecordList({ records, friendId }: SentRecordListProps) {
  return (
    <Each
      items={records}
      renderEmpty={
        <p className="text-sm text-muted-foreground text-center py-4">
          보낸 기록이 없습니다
        </p>
      }
    >
      {(record) => (
        <SentRecordItem key={record.id} record={record} friendId={friendId} />
      )}
    </Each>
  );
}
