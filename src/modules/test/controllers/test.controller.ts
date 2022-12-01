import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { TestProvider } from "../providers/test.provider";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AdminGuard } from "../../../guards/admin.guard";
import { TestCreateDto } from "../dtos/test-create.dto";
import { TestModel } from "../models/test.model";
import { TestUpdateDto } from "../dtos/test-update.dto";
import { TestFilterDto } from "../dtos/test-filter.dto";
import { SearchFilter } from "../../../filters/search.filter";

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('test')
export class TestController {
  constructor(
    @Inject(TestProvider) private testProvider: TestProvider
  ) {
  }

  @Post('all')
  public async getAll(@Body() filter: SearchFilter<TestFilterDto>): Promise<TestModel[]> {
    return await this.testProvider.getAll(filter.filters);
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

  @Delete(':testId')
  public async remove(@Param('testId') testId: number): Promise<boolean> {
    return await this.testProvider.remove(testId);
  }

  @Post('/move/:blockId')
  public async move(@Body('tests') tests: number[], @Param('blockId') blockId: number): Promise<boolean> {
    return await this.testProvider.move(tests, blockId);
  }

  @Post('/remove/:blockId')
  public async removeFromBlock(@Body('tests') tests: number[], @Param('blockId') blockId: number, @Body('removeIfNoBlocks') confirmIfLast: boolean): Promise<boolean> {
    return await this.testProvider.removeFromBlock(tests, blockId, confirmIfLast);
  }
}
