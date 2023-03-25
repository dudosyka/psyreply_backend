import { ResponseStatus } from '@app/application/filters/http-response.filter';

export class WsResponseFilter {
  static response<R>(body: R, status: ResponseStatus) {
    return JSON.stringify({
      ...this.responseObject<R>(body, status),
    });
  }

  static responseObject<R>(body: R, status: ResponseStatus) {
    return {
      body,
      status,
    };
  }
}
