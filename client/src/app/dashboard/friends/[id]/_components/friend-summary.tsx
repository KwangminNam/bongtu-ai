import { Card } from "@/components/ui/card";

interface FriendSummaryProps {
  receivedTotal: number;
  sentTotal: number;
}

export function FriendSummary({ receivedTotal, sentTotal }: FriendSummaryProps) {
  const balance = receivedTotal - sentTotal;

  return (
    <Card className="p-4 mb-6">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-xs text-muted-foreground mb-1">받은 금액</div>
          <div className="font-bold text-sm text-blue-600">
            +{receivedTotal.toLocaleString()}원
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">보낸 금액</div>
          <div className="font-bold text-sm text-red-600">
            -{sentTotal.toLocaleString()}원
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">잔액</div>
          <div
            className={`font-bold text-sm ${balance >= 0 ? "text-green-600" : "text-orange-600"}`}
          >
            {balance >= 0 ? "+" : ""}
            {balance.toLocaleString()}원
          </div>
        </div>
      </div>
    </Card>
  );
}
