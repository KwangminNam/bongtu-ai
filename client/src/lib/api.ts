import { client } from "./fetch-client";

// ── API Methods ──
export const api = {
  events: {
    list: () => client.get<Event[]>("/events"),
    get: (id: string) => client.get<EventDetail>(`/events/${id}`),
    create: (data: CreateEvent) => client.post<Event>("/events", data),
    update: (id: string, data: Partial<CreateEvent>) => client.patch<Event>(`/events/${id}`, data),
    delete: (id: string) => client.delete(`/events/${id}`),
    ocr: (image: string) => client.post<OcrExtractResult>("/events/ocr", { image }),
    ocrBulk: (data: CreateEventOcr) => client.post<OcrBulkResult>("/events/ocr-bulk", data),
  },

  friends: {
    list: () => client.get<Friend[]>("/friends"),
    get: (id: string) => client.get<FriendDetail>(`/friends/${id}`),
    create: (data: CreateFriend) => client.post<Friend>("/friends", data),
    update: (id: string, data: Partial<CreateFriend>) => client.patch<Friend>(`/friends/${id}`, data),
    delete: (id: string) => client.delete(`/friends/${id}`),
  },

  records: {
    byEvent: (eventId: string) => client.get<GiftRecord[]>("/records", { eventId }),
    byFriend: (friendId: string) => client.get<GiftRecord[]>("/records", { friendId }),
    create: (data: CreateRecord) => client.post<GiftRecord>("/records", data),
    update: (id: string, data: UpdateRecord) => client.patch<GiftRecord>(`/records/${id}`, data),
    delete: (id: string) => client.delete(`/records/${id}`),
  },

  sentRecords: {
    byFriend: (friendId: string) => client.get<SentRecord[]>("/sent-records", { friendId }),
    create: (data: CreateSentRecord) => client.post<SentRecord>("/sent-records", data),
    delete: (id: string) => client.delete(`/sent-records/${id}`),
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
    friend: { id: string; name: string; relation: string };
  }[];
  sentTotalAmount: number; // 해당 이벤트 참여자들에게 보낸 총액
}

export interface Friend {
  id: string;
  name: string;
  relation: string;
  records: { amount: number; event: { type: string } }[];
  sentRecords?: { amount: number; eventType: string }[];
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
  sentRecords: SentRecord[];
}

export interface SentRecord {
  id: string;
  amount: number;
  date: string;
  eventType: string;
  memo: string | null;
  friendId: string;
}

export interface GiftRecord {
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

export interface UpdateRecord {
  amount?: number;
  memo?: string;
}

export interface CreateSentRecord {
  amount: number;
  date: string;
  eventType: string;
  memo?: string;
  friendId: string;
}

export interface OcrRecord {
  name: string;
  amount: number;
  relation?: string;
}

export interface OcrExtractResult {
  records: OcrRecord[];
}

export interface CreateEventOcr {
  title: string;
  type: string;
  date: string;
  records: OcrRecord[];
}

export interface OcrBulkResult {
  event: Event;
  records: {
    name: string;
    amount: number;
    friendId: string;
    isNewFriend: boolean;
  }[];
  summary: {
    totalRecords: number;
    totalAmount: number;
    newFriends: number;
  };
}

export { client };
