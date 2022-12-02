import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { BaseFilter } from "./base.filter";

@Catch(HttpException)
export class HttpExceptionFilter extends BaseFilter implements ExceptionFilter {

  catch(exception: HttpException, host: ArgumentsHost): any {
    const response = this.log(exception, host);
    this.sendResponse(response, exception.getStatus(), {
      "status": exception.getStatus(),
      "type": "common",
      "error": exception.message
    });
  }
}
