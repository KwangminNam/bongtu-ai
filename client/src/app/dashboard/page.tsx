import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AsyncBoundary } from "react-flowify";
import { Card } from "@/components/ui/card";
import { LogClick } from "@/lib/logging";
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
        <LogClick eventName="new_event">
          <Button size="sm" className="rounded-full shadow-md" asChild>
            <Link href="/dashboard/events/new">
              <Plus size={16} className="mr-1" />새 이벤트
            </Link>
          </Button>
        </LogClick>
      </div>

      {/* 이벤트 목록 */}
      <AsyncBoundary
        suspense={{
          fallback: (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 animate-pulse border">
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
          ),
        }}
        errorBoundary={{ fallback: <p className="text-sm text-muted-foreground text-center py-10">데이터를 불러오지 못했습니다</p> }}
      >
        <EventListWrapper />
      </AsyncBoundary>

    </div>
  );
}
