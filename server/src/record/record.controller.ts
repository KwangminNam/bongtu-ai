import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { RecordService } from './record.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { CreateRecordDto } from './dto/create-record.dto.js';
import { UpdateRecordDto } from './dto/update-record.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('records')
export class RecordController {
  constructor(@Inject(RecordService) private recordService: RecordService) {}

  @Get()
  find(
    @CurrentUser() user: { id: string },
    @Query('eventId') eventId?: string,
    @Query('friendId') friendId?: string,
  ) {
    if (eventId) return this.recordService.findByEvent(eventId, user.id);
    if (friendId) return this.recordService.findByFriend(friendId, user.id);
    return [];
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateRecordDto) {
    return this.recordService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateRecordDto,
  ) {
    return this.recordService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.recordService.remove(id, user.id);
  }
}
