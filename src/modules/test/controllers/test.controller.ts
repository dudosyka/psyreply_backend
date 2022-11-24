import { Body, Controller, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { TestProvider } from "../providers/test.provider";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AdminGuard } from "../../../guards/admin.guard";
import { TestCreateDto } from "../dtos/test-create.dto";
import { TestModel } from "../models/test.model";
import { TestUpdateDto } from "../dtos/test-update.dto";

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('test')
export class TestController {
  constructor(
    @Inject(TestProvider) private testProvider: TestProvider
  ) {
  }

  @Post()
  public async create(@Req() req, @Body() test: TestCreateDto): Promise<TestModel>  {
    return await this.testProvider.create(test, req.user.id);
  }

  @Patch(':testId')
  public async update(@Param('testId') testId: number, @Body() testUpdate: TestUpdateDto): Promise<TestModel> {
    testUpdate.id = testId;
    return await this.testProvider.update(testUpdate);
  }
}
