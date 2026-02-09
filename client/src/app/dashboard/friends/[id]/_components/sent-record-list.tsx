"use client";

import { SentRecordItem } from "./sent-record-item";
import type { SentRecord } from "@/lib/api";

interface SentRecordListProps {
  records: SentRecord[];
  friendId: string;
}

export function SentRecordList({ records, friendId }: SentRecordListProps) {
  if (records.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        보낸 기록이 없습니다
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {records.map((record) => (
        <SentRecordItem key={record.id} record={record} friendId={friendId} />
      ))}
    </div>
  );
}
