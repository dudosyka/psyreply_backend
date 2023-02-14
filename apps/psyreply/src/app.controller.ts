import {
  Body,
  Controller,
  ForbiddenException,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BcryptUtil } from '@app/application/utils/bcrypt.util';
import mainConf, { ProjectState } from '@app/application/config/main.conf';
import { JwtAuthGuard } from '@app/application/guards/jwt-auth.guard';
import { AdminGuard } from '@app/application/guards/admin.guard';

@Controller()
export class AppController {
  constructor(@Inject(BcryptUtil) private bcryptUtil: BcryptUtil) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('/hash/str')
  createHashStr(@Body('str') str: string) {
    if (mainConf().isDev != ProjectState.PROD) {
      return this.bcryptUtil.hash(str);
    } else {
      throw new ForbiddenException();
    }
  }
}
