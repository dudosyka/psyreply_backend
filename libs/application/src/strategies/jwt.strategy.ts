import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { TokenTypeEnum } from '@app/application/utils/token.type.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('main.jwtSecret'),
    });
  }

  async validate(payload: {
    sub?: number;
    isAdmin?: boolean;
    tokenType: TokenTypeEnum;
    blockId?: number;
    week?: number;
    companyId?: number;
  }) {
    return {
      id: payload.sub,
      isAdmin: payload.isAdmin,
      tokenType: payload.tokenType,
      blockId: payload.blockId,
      companyId: payload.companyId,
      week: payload.week,
    };
  }
}
