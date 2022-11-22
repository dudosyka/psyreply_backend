import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from "../modules/user/providers/auth.service";
import { UserModel } from "../modules/user/models/user.model";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    //We will auth user only by code, so to prevent Unauthorized exception we tell to PassportLocal that our code field is both "username" and "password"
    super({
      usernameField: "code",
      passwordField: "code"
    });
  }

  async validate(code: string): Promise<UserModel> | never {
    const user = await this.authService.validateCode(code);

    if (!user) {
      throw new UnauthorizedException();
    }
    user.emailCode = "";
    await user.save();
    return user;
  }
}
