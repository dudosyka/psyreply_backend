import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthProvider } from '@app/application/modules/auth/providers/auth.provider';
import { UserModel } from '@app/application/modules/user/models/user.model';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authProvider: AuthProvider) {
    //We will auth user only by code, so to prevent Unauthorized exception we tell to PassportLocal that our code field is both "username" and "password"
    super({
      usernameField: 'code',
      passwordField: 'code',
    });
  }

  async validate(code: string): Promise<UserModel> | never {
    const user = await this.authProvider.validateCode(code);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
