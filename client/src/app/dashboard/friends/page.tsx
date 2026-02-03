import { createFetchClient } from "@/lib/fetch-client";
import { auth } from "@/lib/auth";
import { FriendsList } from "./friends-list";
import type { Friend } from "@/lib/api";

async function getFriends(): Promise<Friend[]> {
  const session = await auth();
  if (!session?.accessToken) return [];

  const serverClient = createFetchClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  );
  serverClient.setAuthToken(session.accessToken);

  try {
    return await serverClient.get<Friend[]>("/friends");
  } catch {
    return [];
  }
}

export default async function FriendsPage() {
  const friendsPromise = getFriends();

  return <FriendsList friendsPromise={friendsPromise} />;
}
