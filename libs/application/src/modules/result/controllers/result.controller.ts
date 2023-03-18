import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ResultProvider } from '../providers/result.provider';
import { ResultModel } from '../models/result.model';
import { ResultCreateDto } from '../dto/result-create.dto';
import { JwtAuthGuard } from '@app/application/guards/jwt-auth.guard';
import { ResultFitlerDto } from '../dto/result-fitler.dto';
import { ResultClientOutputDto } from '../dto/result-client-output.dto';
import { ResultUpdateDto } from '../dto/result-update.dto';
import { AdminGuard } from '@app/application/guards/admin.guard';
import { DashboardGuard } from '@app/application/guards/dashboard.guard';
import { UserBlockGuard } from '@app/application/guards/user-block.guard';
import {
  HttpResponseFilter,
  ResponseStatus,
} from '../../../filters/http-response.filter';
import { SuperAdminGuard } from '@app/application/guards/super.admin.guard';

@UseGuards(JwtAuthGuard)
@Controller('result')
export class ResultController {
  constructor(@Inject(ResultProvider) private resultProvider: ResultProvider) {}

  @UseGuards(UserBlockGuard)
  @Post('/block/pass')
  @HttpCode(ResponseStatus.CREATED)
  public async pass(
    @Req() req,
    @Param('blockId') blockId: number,
    @Body() createDto: ResultCreateDto,
  ): Promise<HttpResponseFilter<ResultModel>> {
    return HttpResponseFilter.response<ResultModel>(
      await this.resultProvider.pass(
        req.user.id,
        req.user.blockId,
        req.user.week,
        createDto,
      ),
      ResponseStatus.CREATED,
    );
  }

  @UseGuards(AdminGuard)
  @Post('/all')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getAll(
    @Body() filters: ResultFitlerDto,
    @Req() req,
  ): Promise<HttpResponseFilter<ResultModel[]>> {
    filters.filters.company_id = req.user.companyId;
    return HttpResponseFilter.response<ResultModel[]>(
      await this.resultProvider.getResults(filters),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Post('/super/all')
  @HttpCode(ResponseStatus.SUCCESS)
  public async superGetAll(
    @Body() filters: ResultFitlerDto,
  ): Promise<HttpResponseFilter<ResultModel[]>> {
    return HttpResponseFilter.response<ResultModel[]>(
      await this.resultProvider.getResults(filters),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(UserBlockGuard)
  @Post('/all/last')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getLast(
    @Req() req,
  ): Promise<HttpResponseFilter<ResultClientOutputDto>> {
    return HttpResponseFilter.response<ResultClientOutputDto>(
      await this.resultProvider.getResultsClient(req.user.id, true),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(DashboardGuard)
  @Get('user/all')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getUserResults(
    @Req() req,
  ): Promise<HttpResponseFilter<ResultClientOutputDto>> {
    return HttpResponseFilter.response<ResultClientOutputDto>(
      await this.resultProvider.getResultsClient(req.user.id),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(AdminGuard)
  @Patch(':resultId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async update(
    @Param('resultId') resultId: number,
    @Body() updateDto: ResultUpdateDto,
    @Req() req,
  ): Promise<HttpResponseFilter<ResultModel>> {
    return HttpResponseFilter.response<ResultModel>(
      await this.resultProvider.update(resultId, updateDto, req.user.companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Patch('/super/:resultId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async superUpdate(
    @Param('resultId') resultId: number,
    @Body() updateDto: ResultUpdateDto,
  ): Promise<HttpResponseFilter<ResultModel>> {
    return HttpResponseFilter.response<ResultModel>(
      await this.resultProvider.update(resultId, updateDto),
      ResponseStatus.SUCCESS,
    );
  }
}
