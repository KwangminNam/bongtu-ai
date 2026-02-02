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
    return this.prisma.event.findFirst({
      where: { id, userId },
      include: {
        records: {
          include: { friend: { select: { name: true, relation: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
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
