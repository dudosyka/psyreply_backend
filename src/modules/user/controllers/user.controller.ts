import { Controller, Get, UseGuards, Request } from "@nestjs/common";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AdminGuard } from "../../../guards/admin.guard";

@Controller('user')
export class UserController {

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  get(@Request() req) {
    return req.user;
  }
}
