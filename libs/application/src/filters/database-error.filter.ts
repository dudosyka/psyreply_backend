import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { BaseError } from 'sequelize';
import { BaseHttpExceptionFilter } from './base-http-exception.filter';

@Catch(BaseError)
export class DatabaseErrorFilter
  extends BaseHttpExceptionFilter
  implements ExceptionFilter
{
  catch(exception: BaseError, host: ArgumentsHost): any {
    const response = this.log(exception, host);
    this.sendResponse(response, 500, {
      status: 500,
      type: 'database',
      error: 'Database error',
    });
  }
}
