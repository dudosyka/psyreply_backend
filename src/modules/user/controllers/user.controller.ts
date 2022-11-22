import { Controller, Get } from "@nestjs/common";

@Controller('user')
export class UserController {
  @Get()
  get() {
    throw new Error("test");
    // return 'testsetsetse';
  }
}
