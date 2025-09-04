import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import omit from 'lodash.omit';

@Injectable()
export class LoggerFilters {
  /**
   * @discriptions
   * удаление паролей при логировании
   */
  async filters(req: Request) {
    let logBody;
    if (
      req.originalUrl.includes('session-auth/login') &&
      req.method === 'POST'
    ) {
      logBody = {};
    } else {
      logBody = req.body;
    }
    if (req.originalUrl.includes('door-store') && req.body.password) {
      if (typeof req.body === 'object' && req.body !== null) {
        logBody = omit(req.body, ['login', 'password']);
      } else {
        logBody = req.body;
      }
    }
    return logBody;
  }
}
