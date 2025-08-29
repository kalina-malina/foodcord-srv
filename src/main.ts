import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { networkInterfaces } from 'os';
import useragent from 'express-useragent';
import { PostgresFactory } from 'configs/pg-connect/pg.service';
import { RateLimitGuard } from 'configs/guard/rate-limit.guard';
import { RedisService } from 'configs/redis/redis.service';
import { LoggerInterceptor } from 'configs/loger/logger-Interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.getOrThrow('PORT_SERVER');
  const APP_URL =
    Object.values(networkInterfaces())
      .flat()
      .find((i) => i?.family === 'IPv4' && !i?.internal)?.address ||
    'localhost';
  app.use(useragent.express());
  await PostgresFactory.initAuthTables();
  app.setGlobalPrefix('api/v2/');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  app.useGlobalGuards(new RateLimitGuard(app.get(RedisService)));
  app.enableCors({
    origin: true,
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'x-api-key',
      'x-forwarded-for',
    ],
    exposedHeaders: [
      'Content-Type',
      'Authorization',
      'keep-alive',
      'Origin',
      'x-forwarded-for',
      'X-Requested-With',
      'Accept',
      'x-device-type',
    ],
    credentials: true,
  });

  // SWAGGER CONFIGURATION
  const swaggerConfig = new DocumentBuilder()
    .setTitle('')
    .setDescription('API statosphera.ru')
    .setVersion('1.1')
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
      description: 'Access token cookie',
    })
    .addCookieAuth('refresh_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refresh_token',
      description: 'Refresh token cookie',
    })
    // .addBearerAuth({
    //   description: `Please enter token in following format: Bearer <JWT>`,
    //   name: 'Authorization',
    //   bearerFormat: 'Bearer',
    //   scheme: 'Bearer',
    //   type: 'http',
    //   in: 'Header',
    // })
    .setContact('//', '//', '//')
    .setLicense('contacts', 'https://t.me/')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/v2/docs', app, swaggerDocument, {
    swaggerOptions: {
      withCredentials: true,
      docExpansion: 'none', // все операции свернуты
      defaultModelsExpandDepth: -1,
      filter: true,
    },
    customSiteTitle: 'API Docs',
  });

  const logger = new Logger('Bootstrap');
  app.useGlobalInterceptors(new LoggerInterceptor(configService)); // kafkaService
  await app.listen(PORT);
  logger.log(`----------------------------------------------------------`);
  logger.log(`-- Swagger ${APP_URL}:${PORT}/api/v2/docs`);
  logger.log(`-- URL  http://${APP_URL}:${PORT}`);
  logger.log(`-- Server ${configService.getOrThrow('PORT_SERVER')}`);
}
bootstrap();
