import { Controller, Get } from "@nestjs/common";
import { ModelNotFoundException } from "./exceptions/model-not-found.exception";
import { BlockModel } from "./modules/block/models/block.model";

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    throw new ModelNotFoundException<typeof BlockModel>(BlockModel, 34);
  }
}
