import { Body, Controller, Get, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { TestProvider } from "../providers/test.provider";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AdminGuard } from "../../../guards/admin.guard";
import { TestCreateDto } from "../dtos/test-create.dto";
import { TestModel } from "../models/test.model";
import { TestUpdateDto } from "../dtos/test-update.dto";
import { TestFilterDto } from "../dtos/test-filter.dto";

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('test')
export class TestController {
  constructor(
    @Inject(TestProvider) private testProvider: TestProvider
  ) {
  }

  @Get()
  public async getAll(@Body('filter') filter: TestFilterDto): Promise<TestModel[]> {
    return await this.testProvider.getAll(filter);
  }

  @Get(":testId")
  public async getOne(@Param('testId') testId: number): Promise<TestModel> {
    return await this.testProvider.getOne(testId);
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

  @Post(':testId/move/:blockId')
  public async move(@Param('testId') testId: number, @Param('blockId') blockId: number): Promise<boolean> {
    return await this.testProvider.move(testId, blockId, true);
  }

  @Post(':testId/copy/:blockId')
  public async copy(@Param('testId') testId: number, @Param('blockId') blockId: number): Promise<boolean> {
    return await this.testProvider.move(testId, blockId);
  }

  @Post(':testId/remove/:blockId')
  public async removeFromBlock(@Param('testId') testId: number, @Param('blockId') blockId: number, @Body('removeIfNoBlocks') confirmIfLast: boolean): Promise<boolean> {
    return await this.testProvider.removeFromBlock(testId, blockId, confirmIfLast);
  }
}
