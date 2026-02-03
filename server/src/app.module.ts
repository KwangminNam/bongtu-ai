import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { EventModule } from './event/event.module.js';
import { FriendModule } from './friend/friend.module.js';
import { RecordModule } from './record/record.module.js';
import { SentRecordModule } from './sent-record/sent-record.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    EventModule,
    FriendModule,
    RecordModule,
    SentRecordModule,
  ],
})
export class AppModule {}
