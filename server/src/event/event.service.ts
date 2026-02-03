import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.event.findMany({
      where: { userId },
      include: {
        records: { select: { amount: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, userId },
      include: {
        records: {
          include: {
            friend: {
              select: {
                id: true,
                name: true,
                relation: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!event) return null;

    // 해당 이벤트에 참여한 친구들의 ID 목록
    const friendIds = event.records.map((r) => r.friend.id);

    // 해당 친구들에게 보낸 총 금액 계산
    const sentTotal = await this.prisma.sentRecord.aggregate({
      where: {
        userId,
        friendId: { in: friendIds },
      },
      _sum: { amount: true },
    });

    return {
      ...event,
      sentTotalAmount: sentTotal._sum.amount || 0,
    };
  }

  async create(userId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: { ...dto, date: new Date(dto.date), userId },
    });
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    return this.prisma.event.updateMany({
      where: { id, userId },
      data: {
        ...dto,
        ...(dto.date ? { date: new Date(dto.date) } : {}),
      },
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.event.deleteMany({ where: { id, userId } });
  }
}
