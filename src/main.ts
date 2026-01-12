import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import * as compression from "compression";
import helmet from "helmet";

/**
 * CLINICAL SAFETY NOTICE:
 * This application is a CARE-SUPPORT and ESCALATION TOOL.
 * It is NOT a diagnostic system.
 * It is NOT a medical device.
 * It provides early warning awareness for high blood pressure disorders in pregnancy.
 */

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // =============================================
  // SECURITY & MIDDLEWARE
  // =============================================

  // 1. HELMET: Sets various HTTP headers for security
  app.use(helmet());

  // 2. CORS: Restrict cross-origin access
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Restrict to frontend domain
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  // 3. COMPRESSION: Gzip compression for smaller payloads
  app.use(compression());

  // 4. GLOBAL VALIDATION
  // Global validation pipe with strict settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // API prefix
  app.setGlobalPrefix("api/v1");

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n🏥 Maternal Health Support Backend`);
  console.log(`⚠️  CARE-SUPPORT TOOL - NOT A DIAGNOSTIC SYSTEM`);
  console.log(`🚀 Server running on: http://localhost:${port}/api/v1\n`);
}

bootstrap();
