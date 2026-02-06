import { Module } from '@nestjs/common';
import { EventService } from './event.service.js';
import { EventController } from './event.controller.js';
import { OcrModule } from '../ocr/ocr.module.js';

@Module({
  imports: [OcrModule],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
