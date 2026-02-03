import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { auth } from "@/lib/auth";
import { createFetchClient } from "@/lib/fetch-client";

export const maxDuration = 30;

interface EventData {
  id: string;
  title: string;
  type: string;
  date: string;
  records: { amount: number; friend: { name: string; relation: string } }[];
}

interface FriendData {
  id: string;
  name: string;
  relation: string;
  records: { amount: number; event: { title: string; type: string; date: string } }[];
  sentRecords?: { amount: number; date: string; eventType: string; memo: string | null }[];
}

async function getUserData() {
  const session = await auth();
  if (!session?.accessToken) return null;

  const client = createFetchClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  );
  client.setAuthToken(session.accessToken);

  try {
    const [events, friends] = await Promise.all([
      client.get<EventData[]>("/events"),
      client.get<FriendData[]>("/friends"),
    ]);
    return { events, friends, userName: session.user?.name || "사용자" };
  } catch {
    return null;
  }
}

function buildSystemPrompt(data: { events: EventData[]; friends: FriendData[]; userName: string }) {
  const { events, friends, userName } = data;

  // 받은 금액 통계
  const totalReceivedRecords = events.reduce((sum, e) => sum + e.records.length, 0);
  const totalReceivedAmount = events.reduce(
    (sum, e) => sum + e.records.reduce((s, r) => s + r.amount, 0),
    0
  );

  // 보낸 금액 통계
  const totalSentRecords = friends.reduce((sum, f) => sum + (f.sentRecords?.length || 0), 0);
  const totalSentAmount = friends.reduce(
    (sum, f) => sum + (f.sentRecords?.reduce((s, r) => s + r.amount, 0) || 0),
    0
  );

  const eventSummary = events
    .map((e) => {
      const eventTotal = e.records.reduce((s, r) => s + r.amount, 0);
      return `- ${e.title} (${e.type}, ${new Date(e.date).toLocaleDateString("ko-KR")}): ${e.records.length}명에게 받음, ${eventTotal.toLocaleString()}원`;
    })
    .join("\n");

  const friendSummary = friends
    .slice(0, 20)
    .map((f) => {
      const receivedTotal = f.records.reduce((s, r) => s + r.amount, 0);
      const sentTotal = f.sentRecords?.reduce((s, r) => s + r.amount, 0) || 0;
      const receivedCount = f.records.length;
      const sentCount = f.sentRecords?.length || 0;
      return `- ${f.name} (${f.relation}): 받은 기록 ${receivedCount}건 ${receivedTotal.toLocaleString()}원, 보낸 기록 ${sentCount}건 ${sentTotal.toLocaleString()}원`;
    })
    .join("\n");

  return `당신은 "${userName}"님의 경조사 기록을 관리하는 AI 어시스턴트 "마음장부"입니다.

## 역할
- 사용자의 경조사 내역을 분석하고 인사이트를 제공합니다
- 적정 축의금/부의금 금액을 제안합니다
- 관계별, 이벤트별 통계를 제공합니다
- 친근하고 공감하는 한국어로 대화합니다

## 중요: 데이터 구조 설명
- **records** (받은 기록): 사용자의 이벤트(결혼식 등)에서 지인에게 받은 축의금/부의금
- **sentRecords** (보낸 기록): 사용자가 지인의 이벤트에 보낸 축의금/부의금

## 사용자 데이터 요약
- 총 이벤트 (내 행사): ${events.length}개
- 받은 기록: ${totalReceivedRecords}건, 총 ${totalReceivedAmount.toLocaleString()}원
- 보낸 기록: ${totalSentRecords}건, 총 ${totalSentAmount.toLocaleString()}원

## 이벤트 목록 (내 행사에서 받은 기록)
${eventSummary || "(등록된 이벤트 없음)"}

## 지인 목록 (상위 20명)
${friendSummary || "(등록된 지인 없음)"}

## 상세 데이터
이벤트 상세 (records = 해당 이벤트에서 받은 기록):
${JSON.stringify(events, null, 2)}

지인 상세 (records = 받은 기록, sentRecords = 보낸 기록):
${JSON.stringify(friends, null, 2)}

## 지침
1. "~에게 보냈는지" 물으면 sentRecords 데이터를 확인하세요. sentRecords가 없거나 비어있으면 "보낸 기록이 없습니다"라고 답하세요
2. "~에게 받았는지" 물으면 records 데이터를 확인하세요
3. 데이터에 없는 내용은 절대 추측하지 말고 "기록이 없습니다"라고 안내하세요
4. 금액 제안 시 관계, 이전 기록, 한국 문화를 고려하세요
5. 응답은 간결하고 친근하게 작성하세요`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();
  const userData = await getUserData();

  if (!userData) {
    return new Response("Failed to load user data", { status: 500 });
  }

  const result = streamText({
    model: google("gemini-2.5-flash-lite"),
    system: buildSystemPrompt(userData),
    messages,
  });

  return result.toTextStreamResponse();
}
