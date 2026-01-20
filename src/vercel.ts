import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { setupGlobalMiddleware } from './setup';
import express from 'express';

const expressApp = express();

let app: any;

const bootstrap = async () => {
  if (!app) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    setupGlobalMiddleware(app);
    await app.init();
  }
  return app;
};

export default async (req: any, res: any) => {
  await bootstrap();
  expressApp(req, res);
};
