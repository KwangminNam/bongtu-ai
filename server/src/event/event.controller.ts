import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { EventService } from './event.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { CreateEventOcrDto } from './dto/create-event-ocr.dto.js';
import { OcrService } from '../ocr/ocr.service.js';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventController {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @Inject(OcrService) private ocrService: OcrService,
  ) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.eventService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.eventService.findOne(id, user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateEventDto) {
    return this.eventService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.eventService.remove(id, user.id);
  }

  @Post('ocr')
  async extractFromImage(@Body() body: { image: string }) {
    const records = await this.ocrService.extractRecordsFromImage(body.image);
    return { records };
  }

  @Post('ocr-bulk')
  async createFromOcr(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateEventOcrDto,
  ) {
    return this.eventService.createFromOcr(user.id, dto);
  }
}
