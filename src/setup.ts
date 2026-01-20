import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as compression from "compression";
import helmet from "helmet";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function setupGlobalMiddleware(app: INestApplication) {
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
}
