"use server";

import { revalidatePath } from "next/cache";

export async function revalidateEventDetail(eventId: string) {
  revalidatePath(`/dashboard/events/${eventId}`);
}

export async function revalidateFriends() {
  revalidatePath("/dashboard/friends");
}

export async function revalidateFriendDetail(friendId: string) {
  revalidatePath(`/dashboard/friends/${friendId}`);
}

export async function revalidateDashboard() {
  revalidatePath("/dashboard");
}
