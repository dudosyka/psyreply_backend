import { ExceptionFilter, Catch, ArgumentsHost, Inject } from "@nestjs/common";
import { Response } from 'express';
import { LoggerProvider } from "../logger/providers/logger.provider";

@Catch(Error)
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(LoggerProvider) private loggerProvider: LoggerProvider,
  ) {
  }
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();
    if (exception.message !== 'Cannot GET /favicon.ico') {
      this.loggerProvider.log({
        message: exception.message,
        name: exception.name,
        stack: JSON.stringify(exception.stack.split('at').map(el => el.slice(0,el.length - 5)))
      })
    }
    response.setHeader("Status", 500);
    response.send(JSON.stringify({
      'status': 500,
      'error': exception.message
    }));
  }
}
