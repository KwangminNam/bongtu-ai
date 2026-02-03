import { Suspense } from "react";
import Link from "next/link";
import { Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createFetchClient } from "@/lib/fetch-client";
import { auth } from "@/lib/auth";
import { EventList } from "./event-list";
import type { Event } from "@/lib/api";

async function getEvents(): Promise<Event[]> {
  const session = await auth();
  if (!session?.accessToken) return [];

  const serverClient = createFetchClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  );
  serverClient.setAuthToken(session.accessToken);

  try {
    return await serverClient.get<Event[]>("/events");
  } catch {
    return [];
  }
}

function EventListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-muted" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
            <div className="h-5 w-20 bg-muted rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
}

async function EventListWrapper() {
  const events = await getEvents();
  return <EventList events={events} />;
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col px-5 pt-14 pb-24">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            경조사 내역
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">이벤트 목록</p>
        </div>
        <Button size="sm" className="rounded-full shadow-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" asChild>
          <Link href="/dashboard/events/new">
            <Plus size={16} className="mr-1" />새 이벤트
          </Link>
        </Button>
      </div>

      {/* 이벤트 목록 */}
      <Suspense fallback={<EventListSkeleton />}>
        <EventListWrapper />
      </Suspense>

      {/* AI 챗 버튼 (플로팅) */}
      <Link
        href="/dashboard/chat"
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all"
      >
        <MessageCircle size={24} />
      </Link>
    </div>
  );
}
