import { Controller, Get, Inject, Param, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AdminGuard } from "../../../guards/admin.guard";
import { UserProvider } from "../providers/user.provider";
import { AuthService } from "../providers/auth.service";

@Controller("user")
export class UserController {

  constructor(
    @Inject(UserProvider) private userProvider: UserProvider,
    @Inject(AuthService) private authService: AuthService
  ) {
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  get(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':userId/assign')
  public async assignUser(@Param('userId') userId: number): Promise<string> {
    return await this.authService.assignUser(userId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(":userId/move/:companyId")
  moveToCompany(@Param("userId") userId: number, @Param("companyId") companyId: number): Promise<boolean> {
    return this.userProvider.moveToCompany(userId, companyId);
  }
}
