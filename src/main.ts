// Make sure to import the SDK before any other modules
import { otelSDK } from './tracing';
// import tracer from './tracer';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Start SDK before nestjs factory create
  // await tracer.start();
  await otelSDK.start();
  const app = await NestFactory.create(AppModule);

  await app.listen(
    process.env.APP_PORT && Number.isInteger(+process.env.APP_PORT)
      ? +process.env.APP_PORT
      : 8080,
  );
}
bootstrap();
