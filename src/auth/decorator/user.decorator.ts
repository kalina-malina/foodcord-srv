/*
 * получение индификатора пользователя и з куков
 * */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (request.method === 'POST') {
      request.body.originalUrl = request.originalUrl;
    }
    return { url: request.originalUrl };
  },
);
