import { Controller, Get, Inject, Param, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AdminGuard } from "../../../guards/admin.guard";
import { UserProvider } from "../providers/user.provider";

@Controller("user")
export class UserController {

  constructor(
    @Inject(UserProvider) private userProvider: UserProvider
  ) {
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  get(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(":userId/move/:companyId")
  moveToCompany(@Param("userId") userId: number, @Param("companyId") companyId: number): Promise<boolean> {
    return this.userProvider.moveToCompany(userId, companyId);
  }
}
