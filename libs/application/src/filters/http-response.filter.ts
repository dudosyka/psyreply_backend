// noinspection JSUnusedGlobalSymbols

export enum ResponseStatus {
  SUCCESS = 200,
  CREATED,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED,
  FORBIDDEN = 403,
  NOT_FOUND,
  SERVER_ERROR = 500,
}

export class HttpResponseFilter<ResponseType> {
  constructor(private body, private status: ResponseStatus) {
    this.body = body;
    this.status = status;
  }

  static response<T>(body: T, status: ResponseStatus): HttpResponseFilter<T> {
    return new HttpResponseFilter<T>(body, status);
  }
}
