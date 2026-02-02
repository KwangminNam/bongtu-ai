import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FriendService } from './friend.service.js';
import { DevAuthGuard } from '../auth/dev-auth.guard.js'; // TODO: JwtAuthGuard로 되돌릴 것
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { CreateFriendDto } from './dto/create-friend.dto.js';
import { UpdateFriendDto } from './dto/update-friend.dto.js';

@UseGuards(DevAuthGuard)
@Controller('friends')
export class FriendController {
  constructor(private friendService: FriendService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.friendService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.friendService.findOne(id, user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateFriendDto) {
    return this.friendService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateFriendDto,
  ) {
    return this.friendService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.friendService.remove(id, user.id);
  }
}
