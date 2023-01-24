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
import { ResultProvider } from "../providers/result.provider";
import { ResultModel } from "../models/result.model";
import { ResultCreateDto } from "../dto/result-create.dto";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { ResultFitlerDto } from "../dto/result-fitler.dto";
import { ResultClientOutputDto } from "../dto/result-client-output.dto";
import { ResultUpdateDto } from "../dto/result-update.dto";
import { AdminGuard } from "../../../guards/admin.guard";
import { DashboardGuard } from "../../../guards/dashboard.guard";
import { UserBlockGuard } from "../../../guards/user-block.guard";
import { ResponseFilter, ResponseStatus } from "../../../filters/response.filter";

@UseGuards(JwtAuthGuard)
@Controller('result')
export class ResultController {
  constructor(@Inject(ResultProvider) private resultProvider: ResultProvider) {}

  @UseGuards(UserBlockGuard)
  @Post("/block/pass")
  @HttpCode(ResponseStatus.CREATED)
  public async pass(@Req() req, @Param("blockId") blockId: number, @Body() createDto: ResultCreateDto): Promise<ResponseFilter<ResultModel>> {
    return ResponseFilter.response<ResultModel>(await this.resultProvider.pass(req.user.id, req.user.blockId, req.user.week, createDto), ResponseStatus.CREATED);
  }

  @UseGuards(AdminGuard)
  @Post("/all")
  @HttpCode(ResponseStatus.SUCCESS)
  public async getAll(@Body() filters: ResultFitlerDto): Promise<ResponseFilter<ResultModel[]>> {
    return ResponseFilter.response<ResultModel[]>(await this.resultProvider.getResults(filters), ResponseStatus.SUCCESS);
  }

  @UseGuards(UserBlockGuard)
  @Post('/all/last')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getLast(@Req() req): Promise<ResponseFilter<ResultClientOutputDto>> {
    return ResponseFilter.response<ResultClientOutputDto>(await this.resultProvider.getResultsClient(req.user.id, true), ResponseStatus.SUCCESS);
  }

  @UseGuards(DashboardGuard)
  @Get("user/all")
  @HttpCode(ResponseStatus.SUCCESS)
  public async getUserResults(@Req() req): Promise<ResponseFilter<ResultClientOutputDto>> {
    return ResponseFilter.response<ResultClientOutputDto>(await this.resultProvider.getResultsClient(req.user.id), ResponseStatus.SUCCESS);
  }

  @UseGuards(AdminGuard)
  @Patch(":resultId")
  @HttpCode(ResponseStatus.SUCCESS)
  public async update(@Param("resultId") resultId: number, @Body() updateDto: ResultUpdateDto): Promise<ResponseFilter<ResultModel>> {
    return ResponseFilter.response<ResultModel>(await this.resultProvider.update(resultId, updateDto), ResponseStatus.SUCCESS);
  }
}
