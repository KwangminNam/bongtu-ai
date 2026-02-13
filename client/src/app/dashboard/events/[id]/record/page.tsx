import { createFetchClient } from "@/lib/fetch-client";
import { auth } from "@/lib/auth";
import { RecordForm } from "./record-form";
import type { Friend } from "@/lib/api";
import type { EventDetail } from "@/lib/types";

async function getServerClient() {
  const session = await auth();
  if (!session?.accessToken) return null;

  const client = createFetchClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  );
  client.setAuthToken(session.accessToken);
  return client;
}

async function getFriends(): Promise<Friend[]> {
  const client = await getServerClient();
  if (!client) return [];

  try {
    return await client.get<Friend[]>("/friends");
  } catch {
    return [];
  }
}

async function getEventDate(id: string): Promise<string | null> {
  const client = await getServerClient();
  if (!client) return null;

  try {
    const event = await client.get<EventDetail>(`/events/${id}`);
    return event.date;
  } catch {
    return null;
  }
}

export default async function RecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const friendsPromise = getFriends();
  const eventDate = await getEventDate(id);

  return (
    <RecordForm
      eventId={id}
      eventDate={eventDate}
      friendsPromise={friendsPromise}
    />
  );
}
