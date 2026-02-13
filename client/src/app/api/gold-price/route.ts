import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { auth } from "@/lib/auth";

export const maxDuration = 30;

const SYSTEM_PROMPT = `당신은 금 시세 정보를 제공하는 전문 어시스턴트입니다.
Google 검색을 활용하여 최신 금 시세 정보를 찾아 알려주세요.

## 규칙
- 사용자가 요청한 순도(24K, 18K, 14K)에 맞춰 답변하세요
- 금액은 반드시 원(₩) 단위로 표시하세요
- "1돈 = 3.75g"임을 기억하세요
- 두 날짜를 비교하는 경우, 각 순도별로 "약 N% 상승/하락"을 명시하세요
- 답변은 간결하게 핵심 정보만 전달하세요
- 출처를 간단히 언급해주세요
- 마크다운 없이 일반 텍스트로 답변하세요`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { prompt } = await req.json();

  const result = streamText({
    model: google("gemini-2.5-flash-lite"),
    system: SYSTEM_PROMPT,
    prompt,
    tools: {
      google_search: google.tools.googleSearch({}),
    },
  });

  return result.toTextStreamResponse();
}
