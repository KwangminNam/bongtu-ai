import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { SentRecordService } from './sent-record.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { CreateSentRecordDto } from './dto/create-sent-record.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('sent-records')
export class SentRecordController {
  constructor(@Inject(SentRecordService) private sentRecordService: SentRecordService) {}

  @Get()
  find(
    @CurrentUser() user: { id: string },
    @Query('friendId') friendId?: string,
  ) {
    if (friendId) return this.sentRecordService.findByFriend(friendId, user.id);
    return [];
  }

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateSentRecordDto,
  ) {
    return this.sentRecordService.create(user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.sentRecordService.remove(id, user.id);
  }
}
