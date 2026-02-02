import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      datasources: {
        db: { url: process.env.DATABASE_URL },
      },
    });
    this.logger.log(`DB URL: ${process.env.DATABASE_URL?.substring(0, 30)}...`);
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
