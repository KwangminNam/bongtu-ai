import { Module } from '@nestjs/common';
import { RecordService } from './record.service.js';
import { RecordController } from './record.controller.js';

@Module({
  controllers: [RecordController],
  providers: [RecordService],
  exports: [RecordService],
})
export class RecordModule {}
