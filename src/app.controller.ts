import { Body, Controller, ForbiddenException, Get, Inject, Post } from "@nestjs/common";
import { ModelNotFoundException } from "./exceptions/model-not-found.exception";
import { BlockModel } from "./modules/block/models/block.model";
import { BcryptUtil } from "./utils/bcrypt.util";
import mainConf from "./confs/main.conf";

@Controller()
export class AppController {
  constructor(
    @Inject(BcryptUtil) private bcryptUtil: BcryptUtil
  ) {}

  @Get()
  getHello(): string {
    throw new ModelNotFoundException<typeof BlockModel>(BlockModel, 34);
  }

  @Post('/hash/str')
  createHashStr(@Body('str') str: string) {
    if (mainConf.isDev) {
      return this.bcryptUtil.hash(str);
    } else {
      throw new ForbiddenException();
    }
  }
}
