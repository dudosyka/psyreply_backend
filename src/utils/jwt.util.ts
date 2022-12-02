import { JwtService } from "@nestjs/jwt";
import { UserModel } from "../modules/user/models/user.model";
import { TokenTypeEnum } from "./token.type.enum";
import { Injectable } from "@nestjs/common";

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
}
