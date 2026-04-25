
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailScheduler } from './email.scheduler';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [EmailService, EmailScheduler],
  exports: [EmailService],
})
export class EmailModule {}
