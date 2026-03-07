import { Module } from '@nestjs/common';
import { SentRecordController } from './sent-record.controller.js';
import { SentRecordService } from './sent-record.service.js';

@Module({
  controllers: [SentRecordController],
  providers: [SentRecordService],
})
export class SentRecordModule {}
