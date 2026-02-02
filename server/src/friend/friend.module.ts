import { Module } from '@nestjs/common';
import { FriendService } from './friend.service.js';
import { FriendController } from './friend.controller.js';

@Module({
  controllers: [FriendController],
  providers: [FriendService],
  exports: [FriendService],
})
export class FriendModule {}
