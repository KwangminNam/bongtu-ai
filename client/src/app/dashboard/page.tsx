import Link from "next/link";
import { Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "@/components/ui/suspense";
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

async function EventListWrapper() {
  const events = await getEvents();
  return <EventList events={events} />;
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col px-5 pt-14 pb-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            경조사 내역
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">이벤트 목록</p>
        </div>
        <Button size="sm" className="rounded-full shadow-md" asChild>
          <Link href="/dashboard/events/new">
            <Plus size={16} className="mr-1" />새 이벤트
          </Link>
        </Button>
      </div>

      {/* 이벤트 목록 */}
      <Suspense.CardSkeleton count={3}>
        <EventListWrapper />
      </Suspense.CardSkeleton>

    </div>
  );
}
