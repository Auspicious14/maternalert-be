import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { UserProfileModule } from "./user-profile/user-profile.module";
import { BloodPressureModule } from "./blood-pressure/blood-pressure.module";
import { SymptomsModule } from "./symptoms/symptoms.module";
import { CarePriorityModule } from "./care-priority/care-priority.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { EducationModule } from "./education/education.module";
import { AppController } from "./app.controller";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Database (Prisma) - Global module
    DatabaseModule,

    // Domain modules
    AuthModule,
    UserProfileModule,
    BloodPressureModule,
    SymptomsModule,
    CarePriorityModule,
    NotificationsModule,
    EducationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
