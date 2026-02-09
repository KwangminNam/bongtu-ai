import { Card } from "@/components/ui/card";
import { Suspense } from "@/components/ui/suspense";
import { createFetchClient } from "@/lib/fetch-client";
import { auth } from "@/lib/auth";
import { BackButton } from "@/components/back-button";
import { FriendDetailHeader } from "./_components/friend-detail-header";
import { FriendSummary } from "./_components/friend-summary";
import { ReceivedRecordList } from "./_components/received-record-list";
import { SentRecordList } from "./_components/sent-record-list";
import { SentRecordForm } from "./sent-record-form";
import type { FriendDetail } from "@/lib/api";

async function getFriend(id: string): Promise<FriendDetail | null> {
  const session = await auth();
  if (!session?.accessToken) return null;

  const serverClient = createFetchClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  );
  serverClient.setAuthToken(session.accessToken);

  try {
    return await serverClient.get<FriendDetail>(`/friends/${id}`);
  } catch {
    return null;
  }
}

function FriendContentSkeleton() {
  return (
    <>
      <Card className="p-4 mb-6 animate-pulse">
        <div className="h-16 bg-muted rounded" />
      </Card>
      <div className="h-5 w-20 bg-muted rounded animate-pulse mb-3" />
      <div className="flex flex-col gap-2 mb-6">
        {[1, 2].map((i) => (
          <Card key={i} className="p-3 animate-pulse">
            <div className="h-12 bg-muted rounded" />
          </Card>
        ))}
      </div>
      <div className="h-5 w-20 bg-muted rounded animate-pulse mb-3" />
      <div className="flex flex-col gap-2">
        {[1, 2].map((i) => (
          <Card key={i} className="p-3 animate-pulse">
            <div className="h-12 bg-muted rounded" />
          </Card>
        ))}
      </div>
    </>
  );
}

async function FriendHeader({ id }: { id: string }) {
  const friend = await getFriend(id);

  if (!friend) {
    return (
      <div>
        <h1 className="text-xl font-bold">지인</h1>
        <p className="text-sm text-muted-foreground"></p>
      </div>
    );
  }

  return (
    <FriendDetailHeader
      friendId={id}
      name={friend.name}
      relation={friend.relation}
    />
  );
}

async function FriendContent({ id }: { id: string }) {
  const friend = await getFriend(id);

  if (!friend) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        지인을 찾을 수 없습니다
      </p>
    );
  }

  const records = friend.records ?? [];
  const receivedTotal = records.reduce((sum, r) => sum + r.amount, 0);
  const sentRecords = friend.sentRecords ?? [];
  const sentTotal = sentRecords.reduce((sum, r) => sum + r.amount, 0);

  return (
    <>
      <FriendSummary receivedTotal={receivedTotal} sentTotal={sentTotal} />

      <h2 className="font-semibold mb-3">받은 기록</h2>
      <div className="mb-6">
        <ReceivedRecordList records={records} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">보낸 기록</h2>
        <SentRecordForm friendId={id} friendName={friend.name} />
      </div>
      <SentRecordList records={sentRecords} friendId={id} />
    </>
  );
}

export default async function FriendDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col px-5 pt-14 pb-4 h-full overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <Suspense.Skeleton
          skeleton={
            <div className="space-y-2">
              <div className="h-6 w-24 bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </div>
          }
        >
          <FriendHeader id={id} />
        </Suspense.Skeleton>
      </div>

      <Suspense.Skeleton skeleton={<FriendContentSkeleton />}>
        <FriendContent id={id} />
      </Suspense.Skeleton>
    </div>
  );
}
