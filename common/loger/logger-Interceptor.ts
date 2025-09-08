import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError } from 'rxjs';
import { from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Request, Response } from 'express';
import chalk from 'chalk';
import moment from 'moment';
import { PlainLogger } from './castom-logger';
import { ConfigService } from '@nestjs/config';
// import { KafkaService } from '@/providers/kafka/kafka.service';
// import { TOPIC } from '@/providers/kafka/enum/kafka.enum';
import omit from 'lodash.omit';

import platform from 'platform';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new PlainLogger();

  constructor(
    private readonly configService: ConfigService,
    //private readonly kafkaService: KafkaService,
  ) {}

  async filters(req: Request) {
    let logBody;
    let stop = false;
    if (
      req.originalUrl.includes('session-auth/login') &&
      req.method === 'POST'
    ) {
      logBody = {};
    }
    if (req.originalUrl.includes('door-store') && req.body.password) {
      if (typeof req.body === 'object' && req.body !== null) {
        logBody = omit(req.body, ['login', 'password']);
        stop = true;
      }
    }
    return { logBody, stop };
  }

  async createBaseLog(
    req: Request,
    method: string,
    originalUrl: string,
    status_code: number,
    duration_ms: number,
    user: { id?: string; name?: string; email?: string } | null,
    ip: string,
  ) {
    const userDisplay = user?.name || user?.email || user?.id || 'аноним';

    const userAgentString = req.headers['user-agent'] || '';
    const info = platform.parse(userAgentString);

    return {
      create_at: moment().format('YYYY-MM-DD HH:mm:ss'),
      method,
      path: originalUrl,
      status_code,
      duration_ms,
      ip,
      user_id: user?.id ? Number(user.id) : null,
      user_name: userDisplay,
      user_agent: userAgentString,
      browser: info.name || null,
      os: info.os?.family || null,
      query: JSON.stringify(req.query || {}),
      params: JSON.stringify(req.params || {}),
      body: JSON.stringify(req.body || {}),
    };
  }
  async getClientIp(req: Request) {
    const forwarded = req.headers['x-forwarded-for'];
    let ip: string | undefined;

    if (typeof forwarded === 'string') {
      ip = forwarded.split(',')[0];
    }

    if (!ip && req.socket?.remoteAddress) {
      ip = req.socket.remoteAddress;
    }

    if (!ip) {
      return 'unknown';
    }

    if (ip === '::1') {
      return '127.0.0.1';
    }

    if (ip.startsWith('::ffff:')) {
      return ip.replace('::ffff:', '');
    }

    return ip;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();

    const res = ctx.getResponse<Response>();
    const { method, originalUrl } = req;
    const startTime = Date.now();

    return next.handle().pipe(
      mergeMap(async (data) => {
        const durationMs = Date.now() - startTime;
        const statusCode = res.statusCode;
        const user = await this.getUser(req);
        const ip = await this.getClientIp(req);
        const userDisplay = user?.name || user?.email || user?.id || 'аноним';

        const statusColor =
          statusCode >= 500
            ? chalk.red
            : statusCode >= 400
              ? chalk.yellow
              : statusCode >= 300
                ? chalk.cyan
                : chalk.green;

        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        const methodStr = method.padEnd(4);
        const statusStr = statusColor(statusCode.toString());
        const maxUrlLength = 30;
        const urlStr =
          originalUrl.length > maxUrlLength
            ? originalUrl.slice(0, maxUrlLength - 3) + '...'
            : originalUrl.padEnd(maxUrlLength);
        const timeStr = `${durationMs}ms`.padStart(5);
        const userStr = `👤 ${userDisplay}`;

        this.logger.log(
          `${timestamp} | ${methodStr} | ${statusStr} | ${urlStr} | ${timeStr} | ${userStr}`,
        );

        if (
          this.configService.getOrThrow<string>('REDIS_USER') === 'prodServer'
        ) {
          const baseLog = await this.createBaseLog(
            req,
            method,
            originalUrl,
            statusCode,
            durationMs,
            user,
            ip,
          );

          const payload = {
            ...baseLog,
            type: 'info',
            message: null,
            stack: null,
          };

          if (!originalUrl.startsWith('/api/v2/notifications')) {
            void payload;
            //this.kafkaService.sendMessage(TOPIC.LOGER, payload);
          }
        }

        return data;
      }),
      catchError((err) => {
        return from(
          (async () => {
            const durationMs = Date.now() - startTime;
            const user = await this.getUser(req);
            const ip = await this.getClientIp(req);
            const statusCode = err.status || 500;

            this.logger.error(
              `${method} ${originalUrl} ${chalk.red('ERROR')} - ${chalk.red(err.message)}`,
              err.stack,
            );

            const payload = await this.createBaseLog(
              req,
              method,
              originalUrl,
              statusCode,
              durationMs,
              user,
              ip,
            );

            const errorLog = {
              ...payload,
              type: 'error',
              message: err.message || null,
              stack: err.stack || null,
            };

            void errorLog;
            //this.kafkaService.sendMessage(TOPIC.LOGER, errorLog);
            throw err;
          })(),
        );
      }),
    );
  }

  private async getUser(req: Request): Promise<{
    id?: string | undefined;
    name?: string | undefined;
    email?: string | undefined;
  } | null> {
    const user = req.user?.idUser || ('hz' as any);
    if (user && typeof user === 'object') {
      return {
        id: user.idUser,
        name: user.userName,
        email: user.userEmail,
      };
    }
    const id = req.headers['x-user-id'];
    const name = req.headers['x-user-name'];
    const email = req.headers['x-user-email'];
    return id || name || email
      ? { id: String(id), name: String(name), email: String(email) }
      : null;
  }
}
