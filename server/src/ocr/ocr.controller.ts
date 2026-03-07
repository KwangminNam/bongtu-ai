import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
} from '@nestjs/common';
import { OcrService } from './ocr.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('extract')
  async extractFromImage(@Body() body: { image: string }) {
    const records = await this.ocrService.extractRecordsFromImage(body.image);
    return { records };
  }

  @Get('gold-price')
  async getGoldPrice() {
    return this.ocrService.getGoldPrice();
  }
}
