import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupGlobalMiddleware } from "./setup";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupGlobalMiddleware(app);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`\n🏥 Maternal Health Support Backend`);
  console.log(`⚠️  CARE-SUPPORT TOOL - NOT A DIAGNOSTIC SYSTEM`);
  console.log(`🚀 Server running on: http://localhost:${port}/api/v1`);
  console.log(`📡 Network access: http://10.120.165.24:${port}/api/v1\n`);
}

bootstrap();
