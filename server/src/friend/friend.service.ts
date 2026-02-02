import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateFriendDto } from './dto/create-friend.dto.js';
import { UpdateFriendDto } from './dto/update-friend.dto.js';

@Injectable()
export class FriendService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.friend.findMany({
      where: { userId },
      include: {
        records: {
          select: { amount: true, event: { select: { type: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.friend.findFirst({
      where: { id, userId },
      include: {
        records: {
          include: {
            event: { select: { title: true, type: true, date: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(userId: string, dto: CreateFriendDto) {
    return this.prisma.friend.create({
      data: { ...dto, userId },
    });
  }

  async update(id: string, userId: string, dto: UpdateFriendDto) {
    return this.prisma.friend.updateMany({
      where: { id, userId },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.friend.deleteMany({ where: { id, userId } });
  }
}
