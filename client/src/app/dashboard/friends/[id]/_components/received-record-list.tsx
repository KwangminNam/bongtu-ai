import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { formatAmount } from "@/lib/utils";

interface ReceivedRecord {
  id: string;
  amount: number;
  giftType: string;
  memo: string | null;
  event: { title: string; type: string; date: string };
}

interface ReceivedRecordListProps {
  records: ReceivedRecord[];
}

export function ReceivedRecordList({ records }: ReceivedRecordListProps) {
  if (records.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        받은 기록이 없습니다
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {records.map((record) => (
        <Card key={record.id} className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {record.event.title}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {EVENT_TYPE_LABELS[record.event.type] || record.event.type}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(record.event.date).toLocaleDateString("ko-KR")}
              </div>
            </div>
            <div className="font-semibold text-sm text-blue-600">
              +{formatAmount(record.amount, record.giftType)}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
