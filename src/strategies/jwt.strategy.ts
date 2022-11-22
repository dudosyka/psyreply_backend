import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import mainConf from "../confs/main.conf";
import { TokenTypeEnum } from "../utils/token.type.enum";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: mainConf.jwtConstants.secret,
    });
  }

  async validate(payload: { sub: number, isAdmin: boolean, tokenType: TokenTypeEnum }) {
    return {
      id: payload.sub,
      isAdmin: payload.isAdmin,
      tokenType: payload.tokenType
    };
  }
}
