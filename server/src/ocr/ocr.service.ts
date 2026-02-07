import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface OcrRecord {
  name: string;
  amount: number;
}

export interface GoldPrice {
  pricePerDon: number;
  pricePerGram: number;
  date: string;
}

@Injectable()
export class OcrService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    );
  }

  async getGoldPrice(): Promise<GoldPrice> {
    const today = new Date().toISOString().split('T')[0];
    // 2024년 기준 순금 24K 1돈 시세 (약 45만원)
    // 실제 시세는 한국금거래소 참고: https://www.koreagoldx.co.kr
    return {
      pricePerDon: 450000,
      pricePerGram: 120000,
      date: today,
    };
  }

  async extractRecordsFromImage(base64Image: string): Promise<OcrRecord[]> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `이 이미지는 경조사비 명부(축의금, 조의금 등)입니다.
이미지에서 이름과 금액을 추출하여 JSON 배열로 반환해주세요.

규칙:
- 금액은 숫자만 (원, 만원 등 단위 제거, 예: "10만원" -> 100000)
- 이름은 한글 그대로 유지
- 읽기 어렵거나 불확실한 항목은 제외
- 금액이 없는 항목은 제외

응답 형식 (JSON만 반환, 다른 텍스트 없이):
[
  { "name": "홍길동", "amount": 100000 },
  { "name": "김철수", "amount": 50000 }
]`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
    ]);

    const response = result.response.text();

    // JSON 파싱 (마크다운 코드블록 제거)
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }

    try {
      const records: OcrRecord[] = JSON.parse(jsonMatch[0]);
      // 유효성 검사
      return records.filter(
        (r) =>
          typeof r.name === 'string' &&
          r.name.trim() !== '' &&
          typeof r.amount === 'number' &&
          r.amount > 0,
      );
    } catch {
      return [];
    }
  }
}
