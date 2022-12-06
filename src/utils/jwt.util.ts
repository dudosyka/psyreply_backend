import { JwtService } from "@nestjs/jwt";
import { UserModel } from "../modules/user/models/user.model";
import { TokenTypeEnum } from "./token.type.enum";
import { Injectable } from "@nestjs/common";
import { BlockModel } from "../modules/block/models/block.model";

@Injectable()
export class JwtUtil {
  constructor(private jwtService: JwtService) {
  }

  public signAdmin(user: UserModel): string {
    return this.jwtService.sign({
      sub: user.id,
      isAdmin: user.isAdmin,
      tokenType: TokenTypeEnum.ADMIN
    }, { expiresIn: "30d" });
  }

  public signBlock(block: BlockModel): string {
    return this.jwtService.sign({
      tokenType: TokenTypeEnum.BLOCK,
      blockId: block.id
    })
  }

  public signUserBlock(user: UserModel, block: BlockModel): string {
    return this.jwtService.sign({
      sub: user.id,
      tokenType: TokenTypeEnum.USER_BLOCK,
      blockId: block.id
    })
  }

  public signUser(user: UserModel): string {
    return this.jwtService.sign({
      sub: user.id,
      tokenType: TokenTypeEnum.DASHBOARD,
    });
  }
}
