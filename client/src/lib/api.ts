const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // TODO: 로그인 구현 후 Authorization 헤더 추가
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }
  return res.json();
}

// ── Events ──
export const api = {
  events: {
    list: () => request<Event[]>("/events"),
    get: (id: string) => request<EventDetail>(`/events/${id}`),
    create: (data: CreateEvent) =>
      request<Event>("/events", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<CreateEvent>) =>
      request(`/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request(`/events/${id}`, { method: "DELETE" }),
  },

  friends: {
    list: () => request<Friend[]>("/friends"),
    get: (id: string) => request<FriendDetail>(`/friends/${id}`),
    create: (data: CreateFriend) =>
      request<Friend>("/friends", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<CreateFriend>) =>
      request(`/friends/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request(`/friends/${id}`, { method: "DELETE" }),
  },

  records: {
    byEvent: (eventId: string) =>
      request<Record[]>(`/records?eventId=${eventId}`),
    byFriend: (friendId: string) =>
      request<Record[]>(`/records?friendId=${friendId}`),
    create: (data: CreateRecord) =>
      request("/records", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request(`/records/${id}`, { method: "DELETE" }),
  },
};

// ── Types ──
export interface Event {
  id: string;
  title: string;
  type: string;
  date: string;
  records: { amount: number }[];
}

export interface EventDetail {
  id: string;
  title: string;
  type: string;
  date: string;
  records: {
    id: string;
    amount: number;
    memo: string | null;
    friend: { name: string; relation: string };
  }[];
}

export interface Friend {
  id: string;
  name: string;
  relation: string;
  records: { amount: number; event: { type: string } }[];
}

export interface FriendDetail {
  id: string;
  name: string;
  relation: string;
  records: {
    id: string;
    amount: number;
    memo: string | null;
    event: { title: string; type: string; date: string };
  }[];
}

export interface Record {
  id: string;
  amount: number;
  memo: string | null;
  friend?: { name: string; relation: string };
  event?: { title: string; type: string; date: string };
}

export interface CreateEvent {
  title: string;
  type: string;
  date: string;
}

export interface CreateFriend {
  name: string;
  relation: string;
}

export interface CreateRecord {
  amount: number;
  memo?: string;
  eventId: string;
  friendId?: string;
  friendIds?: string[];
}
