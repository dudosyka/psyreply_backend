import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { BaseHttpExceptionFilter } from './base-http-exception.filter';

@Catch(HttpException)
export class HttpExceptionFilter
  extends BaseHttpExceptionFilter
  implements ExceptionFilter
{
  catch(exception: HttpException, host: ArgumentsHost): any {
    const response = this.log(exception, host);
    this.sendResponse(response, exception.getStatus(), {
      status: exception.getStatus(),
      type: 'common',
      error: exception.message,
    });
  }
}
