import { Inject } from '@nestjs/common';
import { LoggerProvider } from '@app/application/modules/logger/providers/logger.provider';
import { Response } from 'express';
import { Socket } from 'socket.io';

export abstract class BaseExceptionFilter {
  constructor(@Inject(LoggerProvider) private loggerProvider: LoggerProvider) {}

  protected log(exception: Error, name: any = null) {
    if (name == null) name = exception.name;
    this.loggerProvider
      .log({
        message: exception.message,
        name,
        stack: JSON.stringify(
          exception.stack.split('at').map((el) => el.slice(0, el.length - 5)),
        ),
      })
      .then();
  }

  protected abstract sendResponse(
    response: Response | Socket,
    status: number,
    body: any,
  );
}
