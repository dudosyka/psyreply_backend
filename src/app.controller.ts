import { Body, Controller, ForbiddenException, Inject, Post, UseGuards } from "@nestjs/common";
import { BcryptUtil } from "./utils/bcrypt.util";
import mainConf, { ProjectState } from "./confs/main.conf";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AdminGuard } from "./guards/admin.guard";

@Controller()
export class AppController {
  constructor(
    @Inject(BcryptUtil) private bcryptUtil: BcryptUtil
  ) {
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post("/hash/str")
  createHashStr(@Body("str") str: string) {
    if (mainConf.isDev != ProjectState.PROD) {
      return this.bcryptUtil.hash(str);
    } else {
      throw new ForbiddenException();
    }
  }
}
