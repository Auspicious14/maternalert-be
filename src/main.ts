import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import * as compression from "compression";
import helmet from "helmet";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // =============================================
  // SECURITY & MIDDLEWARE
  // =============================================

  // 1. HELMET: Sets various HTTP headers for security
  // Disable CSP for Swagger UI to load correctly
  app.use(helmet({
    contentSecurityPolicy: false,
  }));

  // 2. CORS: Restrict cross-origin access
  app.enableCors({
    origin: "*", // For development, allow all origins
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    allowedHeaders: "Content-Type, Accept, Authorization",
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

  // 5. SWAGGER DOCUMENTATION
  const config = new DocumentBuilder()
    .setTitle('Maternal Health Support API')
    .setDescription('Clinical-safe maternal health support backend - Care escalation tool (NOT a diagnostic system)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`\n🏥 Maternal Health Support Backend`);
  console.log(`⚠️  CARE-SUPPORT TOOL - NOT A DIAGNOSTIC SYSTEM`);
  console.log(`🚀 Server running on: http://localhost:${port}/api/v1`);
  console.log(`📡 Network access: http://192.168.164.47:${port}/api/v1\n`);
}

bootstrap();
