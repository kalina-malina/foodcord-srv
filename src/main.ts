import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { networkInterfaces } from 'os';
import useragent from 'express-useragent';
import { RateLimitGuard } from '@/guard/rate-limit.guard';
import { RedisService } from '@/redis/redis.service';
import { LoggerInterceptor } from '@/loger/logger-Interceptor';
import { PostgresFactory } from '@/pg-connect/foodcord/pg.service';

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
  app.setGlobalPrefix('/api/foodcord');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalGuards(new RateLimitGuard(app.get(RedisService)));
  app.enableCors({
    origin: ['https://statosphera.ru', 'statosphera.ru'],
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'x-api-key',
      'x-forwarded-for',
      'Upgrade',
      'Connection',
      'Sec-WebSocket-Key',
      'Sec-WebSocket-Version',
      'Sec-WebSocket-Protocol',
      'Sec-WebSocket-Extensions',
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
      'Upgrade',
      'Connection',
    ],
    credentials: true,
  });
  // SWAGGER CONFIGURATION
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Чтонибудь напишем потом, пока что пусто не до этого, вот так')
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
  SwaggerModule.setup('api/foodcord/docs', app, swaggerDocument, {
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
  logger.log(`-- Swagger ${APP_URL}:${PORT}/api/foodcord/docs`);
  logger.log(`-- URL  http://${APP_URL}:${PORT}`);
  logger.log(`-- Server ${configService.getOrThrow('PORT_SERVER')}`);
}
bootstrap();
