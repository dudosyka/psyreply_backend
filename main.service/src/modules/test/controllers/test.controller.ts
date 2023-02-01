import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { TestProvider } from "../providers/test.provider";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AdminGuard } from "../../../guards/admin.guard";
import { TestCreateDto } from "../dtos/test-create.dto";
import { TestModel } from "../models/test.model";
import { TestUpdateDto } from "../dtos/test-update.dto";
import { TestFilterDto } from "../dtos/test-filter.dto";
import { SearchFilter } from "../../../filters/search.filter";
import { ResponseFilter, ResponseStatus } from "../../../filters/response.filter";

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('test')
export class TestController {
  constructor(@Inject(TestProvider) private testProvider: TestProvider) {}

  @Post("all")
  @HttpCode(ResponseStatus.SUCCESS)
  public async getAll(@Body() filter: SearchFilter<TestFilterDto>): Promise<ResponseFilter<TestModel[]>> {
    return ResponseFilter.response<TestModel[]>(await this.testProvider.getAll(filter.filters), ResponseStatus.SUCCESS);
  }

  @Get(":testId")
  @HttpCode(ResponseStatus.SUCCESS)
  public async getOne(@Param("testId") testId: number): Promise<ResponseFilter<TestModel>> {
    return ResponseFilter.response<TestModel>(await this.testProvider.getOne(testId), ResponseStatus.SUCCESS);
  }

  @Post()
  @HttpCode(ResponseStatus.CREATED)
  public async create(@Req() req, @Body() test: TestCreateDto): Promise<ResponseFilter<TestModel>> {
    return ResponseFilter.response<TestModel>(await this.testProvider.create(test, req.user.id), ResponseStatus.CREATED);
  }

  @Patch(":testId")
  @HttpCode(ResponseStatus.SUCCESS)
  public async update(@Param("testId") testId: number, @Body() testUpdate: TestUpdateDto): Promise<ResponseFilter<TestModel>> {
    testUpdate.id = testId;
    return ResponseFilter.response<TestModel>(await this.testProvider.update(testUpdate), ResponseStatus.SUCCESS);
  }

  @Delete(":testId")
  @HttpCode(ResponseStatus.SUCCESS)
  public async remove(@Param("testId") testId: number): Promise<ResponseFilter<null>> {
    await this.testProvider.remove(testId)
    return ResponseFilter.response<null>(null, ResponseStatus.NO_CONTENT);
  }

  @Post("/move/:blockId")
  @HttpCode(ResponseStatus.SUCCESS)
  public async move(@Body("tests") tests: number[], @Param("blockId") blockId: number): Promise<ResponseFilter<null>> {
    await this.testProvider.move(tests, blockId);
    return ResponseFilter.response<null>(null, ResponseStatus.NO_CONTENT);
  }

  @Post("/remove/:blockId")
  @HttpCode(ResponseStatus.SUCCESS)
  public async removeFromBlock(@Body("tests") tests: number[], @Param("blockId") blockId: number): Promise<ResponseFilter<null>> {
    await this.testProvider.removeFromBlock(tests, blockId);
    return ResponseFilter.response<null>(null, ResponseStatus.NO_CONTENT);
  }
}
