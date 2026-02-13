import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createFetchClient } from "@/lib/fetch-client";
import type { Event } from "@/lib/types";
import { WelcomeContent } from "./welcome-content";

async function getEvents(accessToken: string): Promise<Event[]> {
  const serverClient = createFetchClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  );
  serverClient.setAuthToken(accessToken);

  try {
    return await serverClient.get<Event[]>("/events");
  } catch {
    return [];
  }
}

export default async function WelcomePage() {
  const session = await auth();
  if (!session?.accessToken) redirect("/");

  const events = await getEvents(session.accessToken);

  return <WelcomeContent hasEvents={events.length > 0} />;
}
