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
} from '@nestjs/common';
import { ResultProvider } from '../providers/result.provider';
import { ResultModel } from '../models/result.model';
import { ResultCreateDto } from '../dto/result-create.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { ResultFitlerDto } from '../dto/result-fitler.dto';
import { ResultClientOutputDto } from '../dto/result-client-output.dto';
import { ResultUpdateDto } from '../dto/result-update.dto';
import { AdminGuard } from '../../../guards/admin.guard';
import { DashboardGuard } from '../../../guards/dashboard.guard';
import { BlockStatDto } from '../dto/block-stat.dto';
import { BlockStatOutputDto } from '../dto/block-stat-output.dto';
import { UserBlockGuard } from '../../../guards/user-block.guard';

@UseGuards(JwtAuthGuard)
@Controller('result')
export class ResultController {
  constructor(@Inject(ResultProvider) private resultProvider: ResultProvider) {}

  @UseGuards(UserBlockGuard)
  @Post('/block/pass')
  public async pass(
    @Req() req,
    @Param('blockId') blockId: number,
    @Body() createDto: ResultCreateDto,
  ): Promise<ResultModel> {
    return this.resultProvider.pass(
      req.user.id,
      req.user.blockId,
      req.user.week,
      createDto,
    );
  }

  @UseGuards(AdminGuard)
  @Post('/all')
  public async getAll(
    @Body() filters: ResultFitlerDto,
  ): Promise<ResultModel[]> {
    return this.resultProvider.getResults(filters);
  }

  @UseGuards(UserBlockGuard)
  @Post('/all/last')
  public async getLast(@Req() req): Promise<ResultClientOutputDto> {
    return this.resultProvider.getResultsClient(req.user.id, true);
  }

  @UseGuards(AdminGuard)
  @Post('/calculate')
  public async calculateBlockStat(
    @Body() blockStatDto: BlockStatDto,
  ): Promise<BlockStatOutputDto> {
    const res = await this.resultProvider.calculateBlockStat(blockStatDto);
    if (res instanceof BlockStatOutputDto) return res;
  }

  @UseGuards(AdminGuard)
  @Post('/calculate/special')
  public async calculateBlockStatByIds(
    @Body() body: { ids: number[] },
  ): Promise<any> {
    return this.resultProvider.calculateBlockStat(false, body.ids);
  }

  @UseGuards(AdminGuard)
  @Post('/calculate/save')
  public async saveBlockStat(
    @Body() blockStatDto: BlockStatDto,
  ): Promise<BlockStatOutputDto> {
    return this.resultProvider.saveBlockStat(blockStatDto);
  }

  @UseGuards(DashboardGuard)
  @Get('user/all')
  public async getUserResults(@Req() req): Promise<ResultClientOutputDto> {
    return this.resultProvider.getResultsClient(req.user.id);
  }

  @UseGuards(AdminGuard)
  @Patch(':resultId')
  public async update(
    @Param('resultId') resultId: number,
    @Body() updateDto: ResultUpdateDto,
  ): Promise<ResultModel> {
    return this.resultProvider.update(resultId, updateDto);
  }
}
