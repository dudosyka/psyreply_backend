import { ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { TransactionUtil } from '../utils/TransactionUtil';
import { HttpResponseFilter } from './http-response.filter';
import { BaseExceptionFilter } from '@app/application/filters/base-exception.filter';

export class BaseHttpExceptionFilter extends BaseExceptionFilter {
  log(exception: Error, host: ArgumentsHost): Response {
    console.error(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    if (exception.message !== 'Cannot GET /favicon.ico') {
      super.log(exception, `${exception.name} ${request.url}`);
    }
    return response;
  }

  async sendResponse(response: Response, status: number, body: any) {
    if (TransactionUtil.isSet()) {
      await TransactionUtil.rollback();
      response.status(status).send(HttpResponseFilter.response(body, status));
    } else {
      response.status(status).send(HttpResponseFilter.response(body, status));
    }
  }
}
