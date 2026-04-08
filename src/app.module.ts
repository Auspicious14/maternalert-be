import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { UserProfileModule } from "./user-profile/user-profile.module";
import { BloodPressureModule } from "./blood-pressure/blood-pressure.module";
import { SymptomsModule } from "./symptoms/symptoms.module";
import { CarePriorityModule } from "./care-priority/care-priority.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { EducationModule } from "./education/education.module";
import { ClinicFinderModule } from "./clinic-finder/clinic-finder.module";
import { MonitoringEngineModule } from "./monitoring-engine/monitoring-engine.module";
import { AppController } from "./app.controller";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Throttling
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 20,
      },
    ]),

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
    ClinicFinderModule,
    MonitoringEngineModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
