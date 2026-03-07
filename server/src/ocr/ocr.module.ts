import { Module } from '@nestjs/common';
import { OcrService } from './ocr.service.js';
import { OcrController } from './ocr.controller.js';

@Module({
  controllers: [OcrController],
  providers: [OcrService],
  exports: [OcrService],
})
export class OcrModule {}
