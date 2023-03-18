import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { BaseHttpExceptionFilter } from './base-http-exception.filter';

@Catch(Error)
export class GlobalExceptionFilter
  extends BaseHttpExceptionFilter
  implements ExceptionFilter
{
  catch(exception: Error, host: ArgumentsHost) {
    const response = this.log(exception, host);
    this.sendResponse(response, 500, {
      status: 500,
      type: 'unknown',
      error: exception.message,
    });
  }
}
