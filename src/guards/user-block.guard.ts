import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TokenTypeEnum } from '../utils/token.type.enum';

@Injectable()
export class UserBlockGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return request.user.tokenType == TokenTypeEnum.USER_BLOCK;
  }
}
