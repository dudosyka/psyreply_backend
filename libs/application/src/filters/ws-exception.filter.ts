import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  HttpException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ValidationExceptionFilter } from '@app/application/filters/validation-exception.filter';
import { BaseExceptionFilter } from '@app/application/filters/base-exception.filter';
import { WsResponseFilter } from '@app/application/filters/ws-response.filter';
import { ResponseStatus } from '@app/application/filters/http-response.filter';

@Catch(WsException, HttpException)
export class WsExceptionFilter extends BaseExceptionFilter {
  public catch(exception: HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    this.handleError(client, exception);
  }

  protected sendResponse(response: Socket, status: number, body: any) {
    response.send(WsResponseFilter.response(body, status));
  }

  public handleError(client: Socket, exception: HttpException | WsException) {
    this.log(exception);
    if (exception instanceof HttpException) {
      if (exception instanceof BadRequestException) {
        const message = ValidationExceptionFilter.parseMessage(exception, [
          exception.message,
        ]);
        this.sendResponse(client, ResponseStatus.BAD_REQUEST, {
          error: message,
        });
      }
      // handle http exception
    } else {
      this.sendResponse(client, ResponseStatus.SERVER_ERROR, {
        error: exception.message,
      });
      // handle websocket exception
    }
  }
}
