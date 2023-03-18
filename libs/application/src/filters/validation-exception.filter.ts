import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { BaseHttpExceptionFilter } from './base-http-exception.filter';

@Catch(BadRequestException)
export class ValidationExceptionFilter
  extends BaseHttpExceptionFilter
  implements ExceptionFilter
{
  static formatObject(key, value) {
    console.log(key);
    const arrKey = key.split('.');
    if (arrKey.length == 1) return { [key]: value };
    else {
      return {
        [arrKey[arrKey.length - 1]]: ValidationExceptionFilter.formatObject(
          arrKey.filter((el, key) => key != arrKey.length - 1).join('.'),
          value,
        ),
      };
    }
  }

  static formatString(str) {
    const split = str.split('.');
    if (split.length == 1) {
      return {
        [split[0].split(' ')[0]]: split[0]
          .split(' ')
          .filter((el, key) => key != 0)
          .join(' '),
      };
    } else {
      const key =
        split[split.length - 1].split(' ')[0] +
        '.' +
        split
          .filter((el, key) => key < split.length - 1)
          .reverse()
          .join('.');
      const value = split[split.length - 1]
        .split(' ')
        .filter((el, key) => key != 0)
        .join(' ');
      return ValidationExceptionFilter.formatObject(key, value);
    }
  }

  static parseMessage(exception, err): string[] {
    if (typeof exception.getResponse() != 'string') {
      let message = [];
      Object.keys(exception.getResponse()).forEach((el) => {
        if (el == 'message') message = exception.getResponse()[el];
      });
      if (message.map)
        err = message.map((el) => {
          return ValidationExceptionFilter.formatString(el);
        });
      else err = message;
    }

    return err;
  }

  catch(exception: BadRequestException, host: ArgumentsHost): any {
    const response = this.log(exception, host);
    let err: any = [exception.message];

    err = ValidationExceptionFilter.parseMessage(exception, err);

    this.sendResponse(response, exception.getStatus(), {
      status: exception.getStatus(),
      type: 'common',
      error: err,
    });
  }
}
