import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TokenTypeEnum } from '@app/application/utils/token.type.enum';

export class DashboardAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return (
      request.user.tokenType == TokenTypeEnum.DASHBOARD_ADMIN &&
      request.user.companyId
    );
  }
}
