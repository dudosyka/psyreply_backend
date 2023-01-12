import { Body, Controller, Get, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ResultProvider } from "../providers/result.provider";
import { ResultModel } from "../models/result.model";
import { ResultCreateDto } from "../dto/result-create.dto";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { ResultFitlerDto } from "../dto/result-fitler.dto";
import { ResultClientOutputDto } from "../dto/result-client-output.dto";
import { ResultUpdateDto } from "../dto/result-update.dto";
import { AdminGuard } from "../../../guards/admin.guard";
import { DashboardGuard } from "../../../guards/dashboard.guard";
import { BlockStatDto } from "../dto/block-stat.dto";
import { BlockStatOutputDto } from "../dto/block-stat-output.dto";
import { UserBlockGuard } from "../../../guards/user-block.guard";
import { ResponseFilter, ResponseStatus } from "../../../filters/response.filter";

@UseGuards(JwtAuthGuard)
@Controller("result")
export class ResultController {
  constructor(
    @Inject(ResultProvider) private resultProvider: ResultProvider
  ) {
  }

  @UseGuards(UserBlockGuard)
  @Post("/block/pass")
  public async pass(@Req() req, @Param("blockId") blockId: number, @Body() createDto: ResultCreateDto): Promise<ResponseFilter<ResultModel>> {
    return ResponseFilter.response<ResultModel>(await this.resultProvider.pass(req.user.id, req.user.blockId, req.user.week, createDto), ResponseStatus.CREATED);
  }

  @UseGuards(AdminGuard)
  @Post("/all")
  public async getAll(@Body() filters: ResultFitlerDto): Promise<ResponseFilter<ResultModel[]>> {
    return ResponseFilter.response<ResultModel[]>(await this.resultProvider.getResults(filters), ResponseStatus.SUCCESS);
  }

  @UseGuards(UserBlockGuard)
  @Post('/all/last')
  public async getLast(@Req() req): Promise<ResponseFilter<ResultClientOutputDto>> {
    return ResponseFilter.response<ResultClientOutputDto>(await this.resultProvider.getResultsClient(req.user.id, true), ResponseStatus.SUCCESS);
  }

  @UseGuards(AdminGuard)
  @Post("/calculate")
  public async calculateBlockStat(@Body() blockStatDto: BlockStatDto): Promise<ResponseFilter<BlockStatOutputDto>> {
    const res = await this.resultProvider.calculateBlockStat(blockStatDto);
    if (res instanceof BlockStatOutputDto)
      return ResponseFilter.response<BlockStatOutputDto>(res, ResponseStatus.SUCCESS);
  }

  @UseGuards(AdminGuard)
  @Post('/calculate/special')
  public async calculateBlockStatByIds(@Body() body: { ids: number[] }): Promise<ResponseFilter<any>> {
    return ResponseFilter.response<any>(await this.resultProvider.calculateBlockStat(false, body.ids), ResponseStatus.SUCCESS)
  }

  @UseGuards(AdminGuard)
  @Post("/calculate/save")
  public async saveBlockStat(@Body() blockStatDto: BlockStatDto): Promise<ResponseFilter<BlockStatOutputDto>> {
    return ResponseFilter.response<BlockStatOutputDto>(await this.resultProvider.saveBlockStat(blockStatDto), ResponseStatus.CREATED);
  }

  @UseGuards(DashboardGuard)
  @Get("user/all")
  public async getUserResults(@Req() req): Promise<ResponseFilter<ResultClientOutputDto>> {
    return ResponseFilter.response<ResultClientOutputDto>(await this.resultProvider.getResultsClient(req.user.id), ResponseStatus.SUCCESS);
  }

  @UseGuards(AdminGuard)
  @Patch(":resultId")
  public async update(@Param("resultId") resultId: number, @Body() updateDto: ResultUpdateDto): Promise<ResponseFilter<ResultModel>> {
    return ResponseFilter.response<ResultModel>(await this.resultProvider.update(resultId, updateDto), ResponseStatus.SUCCESS);
  }
}
