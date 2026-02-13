import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { CreateEventOcrDto } from './dto/create-event-ocr.dto.js';

@Injectable()
export class EventService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.event.findMany({
      where: { userId },
      include: {
        records: { select: { amount: true, giftType: true } },
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

  async createFromOcr(userId: string, dto: CreateEventOcrDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. 이벤트 생성
      const event = await tx.event.create({
        data: {
          title: dto.title,
          type: dto.type,
          date: new Date(dto.date),
          userId,
        },
      });

      // 2. 각 레코드에 대해 Friend 찾기/생성 후 Record 생성
      const recordResults = [];

      for (const record of dto.records) {
        // 기존 Friend 찾기 (이름으로 매칭)
        let friend = await tx.friend.findFirst({
          where: { userId, name: record.name },
        });

        const isNewFriend = !friend;

        // 없으면 새로 생성
        if (!friend) {
          friend = await tx.friend.create({
            data: {
              name: record.name,
              relation: record.relation || '미분류',
              userId,
            },
          });
        }

        // Record 생성
        await tx.record.create({
          data: {
            amount: record.amount,
            eventId: event.id,
            friendId: friend.id,
          },
        });

        recordResults.push({
          name: record.name,
          amount: record.amount,
          friendId: friend.id,
          isNewFriend,
        });
      }

      return {
        event,
        records: recordResults,
        summary: {
          totalRecords: recordResults.length,
          totalAmount: recordResults.reduce((sum, r) => sum + r.amount, 0),
          newFriends: recordResults.filter((r) => r.isNewFriend).length,
        },
      };
    });
  }
}
