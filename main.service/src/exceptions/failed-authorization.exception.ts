import { HttpException } from '@nestjs/common';

export class FailedAuthorizationException<T> extends HttpException {
  constructor(password: boolean, email: boolean) {
    let body = {}
    if (password) body = { password: 'failed' };
    if (email) body = { email: 'failed' };
    super(body, 403);
  }
}
