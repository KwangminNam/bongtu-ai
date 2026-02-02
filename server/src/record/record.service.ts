import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRecordDto } from './dto/create-record.dto.js';

@Injectable()
export class RecordService {
  constructor(private prisma: PrismaService) {}

  async findByEvent(eventId: string, userId: string) {
    return this.prisma.record.findMany({
      where: { eventId, event: { userId } },
      include: { friend: { select: { name: true, relation: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByFriend(friendId: string, userId: string) {
    return this.prisma.record.findMany({
      where: { friendId, friend: { userId } },
      include: {
        event: { select: { title: true, type: true, date: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateRecordDto) {
    const ids = dto.friendIds ?? (dto.friendId ? [dto.friendId] : []);

    // 지인이 해당 유저 소유인지 확인
    const friends = await this.prisma.friend.findMany({
      where: { id: { in: ids }, userId },
      select: { id: true },
    });
    const validIds = friends.map((f) => f.id);

    return this.prisma.record.createMany({
      data: validIds.map((friendId) => ({
        amount: dto.amount,
        memo: dto.memo,
        eventId: dto.eventId,
        friendId,
      })),
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.record.deleteMany({
      where: { id, event: { userId } },
    });
  }
}
