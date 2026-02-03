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

  const totalRecords = events.reduce((sum, e) => sum + e.records.length, 0);
  const totalAmount = events.reduce(
    (sum, e) => sum + e.records.reduce((s, r) => s + r.amount, 0),
    0
  );

  const eventSummary = events
    .map((e) => {
      const eventTotal = e.records.reduce((s, r) => s + r.amount, 0);
      return `- ${e.title} (${e.type}, ${new Date(e.date).toLocaleDateString("ko-KR")}): ${e.records.length}명, ${eventTotal.toLocaleString()}원`;
    })
    .join("\n");

  const friendSummary = friends
    .slice(0, 20)
    .map((f) => {
      const friendTotal = f.records.reduce((s, r) => s + r.amount, 0);
      return `- ${f.name} (${f.relation}): ${f.records.length}건, ${friendTotal.toLocaleString()}원`;
    })
    .join("\n");

  return `당신은 "${userName}"님의 경조사 기록을 관리하는 AI 어시스턴트 "마음장부"입니다.

## 역할
- 사용자의 경조사 내역을 분석하고 인사이트를 제공합니다
- 적정 축의금/부의금 금액을 제안합니다
- 관계별, 이벤트별 통계를 제공합니다
- 친근하고 공감하는 한국어로 대화합니다

## 사용자 데이터 요약
- 총 이벤트: ${events.length}개
- 총 기록: ${totalRecords}건
- 총 금액: ${totalAmount.toLocaleString()}원

## 이벤트 목록
${eventSummary || "(등록된 이벤트 없음)"}

## 지인 목록 (상위 20명)
${friendSummary || "(등록된 지인 없음)"}

## 상세 데이터
이벤트 상세:
${JSON.stringify(events, null, 2)}

지인 상세:
${JSON.stringify(friends, null, 2)}

## 지침
1. 사용자가 특정 지인이나 이벤트에 대해 물으면 데이터를 기반으로 정확히 답변하세요
2. 금액 제안 시 관계, 이전 기록, 한국 문화를 고려하세요
3. 데이터에 없는 내용은 추측하지 말고 "기록이 없습니다"라고 안내하세요
4. 응답은 간결하고 친근하게 작성하세요`;
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
