import { JwtService } from '@nestjs/jwt';
import { UserModel } from '../modules/user/models/user.model';
import { TokenTypeEnum } from './token.type.enum';
import { Injectable } from '@nestjs/common';
import { BlockModel } from '../modules/block/models/block.model';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtUtil {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  public verify(token: string) {
    return this.jwtService.verify(token, { secret: this.configService.get('main.jwtSecret') });
  }

  public signAdmin(user: UserModel): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        isAdmin: user.isAdmin,
        tokenType: TokenTypeEnum.ADMIN,
        companyId: user.company_id
      },
      { expiresIn: '30d' },
    );
  }

  public signBlock(block: BlockModel, week: number): string {
    return this.jwtService.sign({
      tokenType: TokenTypeEnum.BLOCK,
      blockId: block.id,
      companyId: block.company_id,
      week,
    });
  }

  public signUserBlock(
    user: UserModel,
    week: number,
    block: BlockModel,
  ): string {
    return this.jwtService.sign({
      sub: user.id,
      tokenType: TokenTypeEnum.USER_BLOCK,
      blockId: block.id,
      companyId: block.company_id,
      week,
    });
  }

  public signUser(user: UserModel): string {
    return this.jwtService.sign({
      sub: user.id,
      tokenType: TokenTypeEnum.DASHBOARD,
    });
  }
}
