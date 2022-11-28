import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";
import { BaseFilter } from "./base.filter";

@Catch(Error)
export class GlobalExceptionFilter extends BaseFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const response = this.log(exception, host);
    this.sendResponse(response, 500, {
      'status': 500,
      'type': 'unknown',
      'error': exception.message
    })
  }
}
