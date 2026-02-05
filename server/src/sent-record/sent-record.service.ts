import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSentRecordDto } from './dto/create-sent-record.dto.js';

@Injectable()
export class SentRecordService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async findByFriend(friendId: string, userId: string) {
    return this.prisma.sentRecord.findMany({
      where: { friendId, userId },
      orderBy: { date: 'desc' },
    });
  }

  async create(userId: string, dto: CreateSentRecordDto) {
    // 지인이 해당 유저 소유인지 확인
    const friend = await this.prisma.friend.findFirst({
      where: { id: dto.friendId, userId },
    });

    if (!friend) {
      throw new Error('Friend not found');
    }

    return this.prisma.sentRecord.create({
      data: {
        amount: dto.amount,
        date: new Date(dto.date),
        eventType: dto.eventType,
        memo: dto.memo,
        friendId: dto.friendId,
        userId,
      },
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.sentRecord.deleteMany({
      where: { id, userId },
    });
  }
}
