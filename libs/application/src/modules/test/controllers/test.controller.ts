import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TestProvider } from '../providers/test.provider';
import { JwtAuthGuard } from '@app/application/guards/jwt-auth.guard';
import { AdminGuard } from '@app/application/guards/admin.guard';
import { TestCreateDto } from '../dtos/test-create.dto';
import { TestModel } from '../models/test.model';
import { TestUpdateDto } from '../dtos/test-update.dto';
import { TestFilterDto } from '../dtos/test-filter.dto';
import { SearchFilter } from '../../../filters/search.filter';
import {
  HttpResponseFilter,
  ResponseStatus,
} from '../../../filters/http-response.filter';
import { SuperAdminGuard } from '@app/application/guards/super-admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('test')
export class TestController {
  constructor(@Inject(TestProvider) private testProvider: TestProvider) {}

  @Post('all')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getAll(
    @Body() filter: SearchFilter<TestFilterDto>,
    @Req() req,
  ): Promise<HttpResponseFilter<TestModel[]>> {
    if (!filter.filters.company_id)
      filter.filters.company_id = [req.user.companyId, null];
    return HttpResponseFilter.response<TestModel[]>(
      await this.testProvider.getAll(filter.filters),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Post('/super/all')
  @HttpCode(ResponseStatus.SUCCESS)
  public async superGetAll(
    @Body() filter: SearchFilter<TestFilterDto>,
  ): Promise<HttpResponseFilter<TestModel[]>> {
    return HttpResponseFilter.response<TestModel[]>(
      await this.testProvider.getAll(filter.filters),
      ResponseStatus.SUCCESS,
    );
  }

  @Get(':testId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getOne(
    @Param('testId') testId: number,
    @Req() req,
  ): Promise<HttpResponseFilter<TestModel>> {
    return HttpResponseFilter.response<TestModel>(
      await this.testProvider.getOne(testId, req.user.companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @Get('/super/:testId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async superGetOne(
    @Param('testId') testId: number,
  ): Promise<HttpResponseFilter<TestModel>> {
    return HttpResponseFilter.response<TestModel>(
      await this.testProvider.getOne(testId),
      ResponseStatus.SUCCESS,
    );
  }

  @Post()
  @HttpCode(ResponseStatus.CREATED)
  public async create(
    @Req() req,
    @Body() test: TestCreateDto,
  ): Promise<HttpResponseFilter<TestModel>> {
    test.company_id = req.user.companyId;
    return HttpResponseFilter.response<TestModel>(
      await this.testProvider.create(test, req.user.id),
      ResponseStatus.CREATED,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Post('/super/create')
  @HttpCode(ResponseStatus.CREATED)
  public async superCreate(
    @Req() req,
    @Body() test: TestCreateDto,
  ): Promise<HttpResponseFilter<TestModel>> {
    return HttpResponseFilter.response<TestModel>(
      await this.testProvider.create(test, req.user.id),
      ResponseStatus.CREATED,
    );
  }

  @Patch(':testId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async update(
    @Param('testId') testId: number,
    @Body() testUpdate: TestUpdateDto,
    @Req() req,
  ): Promise<HttpResponseFilter<TestModel>> {
    testUpdate.id = testId;
    return HttpResponseFilter.response<TestModel>(
      await this.testProvider.update(testUpdate, req.user.companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Patch('/super/:testId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async superUpdate(
    @Param('testId') testId: number,
    @Body() testUpdate: TestUpdateDto,
  ): Promise<HttpResponseFilter<TestModel>> {
    testUpdate.id = testId;
    return HttpResponseFilter.response<TestModel>(
      await this.testProvider.update(testUpdate, null),
      ResponseStatus.SUCCESS,
    );
  }

  @Delete(':testId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async remove(
    @Param('testId') testId: number,
    @Req() req,
  ): Promise<HttpResponseFilter<null>> {
    await this.testProvider.remove({
      testId,
      editorCompany: req.user.companyId,
    });
    return HttpResponseFilter.response<null>(null, ResponseStatus.NO_CONTENT);
  }

  @UseGuards(SuperAdminGuard)
  @Delete('/super/:testId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async superRemove(
    @Param('testId') testId: number,
  ): Promise<HttpResponseFilter<null>> {
    await this.testProvider.remove({ testId, editorCompany: null });
    return HttpResponseFilter.response<null>(null, ResponseStatus.NO_CONTENT);
  }

  @Post('/move/:blockId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async move(
    @Body('tests') tests: number[],
    @Param('blockId') blockId: number,
  ): Promise<HttpResponseFilter<null>> {
    await this.testProvider.move(tests, blockId);
    return HttpResponseFilter.response<null>(null, ResponseStatus.NO_CONTENT);
  }

  @Post('/remove/:blockId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async removeFromBlock(
    @Body('tests') tests: number[],
    @Param('blockId') blockId: number,
  ): Promise<HttpResponseFilter<null>> {
    await this.testProvider.removeFromBlock(tests, blockId);
    return HttpResponseFilter.response<null>(null, ResponseStatus.NO_CONTENT);
  }

  @Get('/export/:testId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async exportTest(
    @Param('testId') testId: number,
    @Req() req,
  ): Promise<HttpResponseFilter<string>> {
    return HttpResponseFilter.response<string>(
      await this.testProvider.export(testId, req.user.companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Get('/super/export/:testId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async superExportTest(
    @Param('testId') testId: number,
  ): Promise<HttpResponseFilter<string>> {
    return HttpResponseFilter.response<string>(
      await this.testProvider.export(testId),
      ResponseStatus.SUCCESS,
    );
  }

  @Post('/import')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(ResponseStatus.SUCCESS)
  public async importTest(
    @UploadedFile() file: Express.Multer.File,
    @Param('testId') testId: number,
    @Req() req,
  ): Promise<HttpResponseFilter<TestModel>> {
    return HttpResponseFilter.response<TestModel>(
      await this.testProvider.importTest(file, req.user.companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Post('/super/import')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(ResponseStatus.SUCCESS)
  public async superImportTest(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<HttpResponseFilter<TestModel>> {
    return HttpResponseFilter.response<TestModel>(
      await this.testProvider.importTest(file),
      ResponseStatus.SUCCESS,
    );
  }
}
