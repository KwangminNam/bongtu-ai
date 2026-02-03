import { Module } from '@nestjs/common';
import { SentRecordController } from './sent-record.controller.js';
import { SentRecordService } from './sent-record.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [SentRecordController],
  providers: [SentRecordService],
})
export class SentRecordModule {}
