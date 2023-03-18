import { ResponseStatus } from '@app/application/filters/http-response.filter';

export class WsResponseFilter {
  static response<R>(body: R, status: ResponseStatus) {
    return JSON.stringify({
      status,
      body,
    });
  }
}
