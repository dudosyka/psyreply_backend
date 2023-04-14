import { CanActivate, Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtUtil } from '../utils/jwt.util';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(@Inject(JwtUtil) private jwtUtil: JwtUtil) {}

  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    const bearerToken =
      context.args[0].handshake.headers.authorization.split(' ')[1];
    try {
      const decoded = this.jwtUtil.verify(bearerToken);
      context.args[0].user = decoded;
      return decoded.isAdmin;
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }
}
