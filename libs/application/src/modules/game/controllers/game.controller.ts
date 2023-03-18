import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { UserBlockGuard } from '../../../guards/user-block.guard';
import { GameResultModel } from '../models/game-result.model';
import { GameProvider } from '../providers/game.provider';
import { GameResultCreateDto } from '../dtos/game-result-create.dto';
import {
  HttpResponseFilter,
  ResponseStatus,
} from '../../../filters/http-response.filter';

@UseGuards(JwtAuthGuard, UserBlockGuard)
@Controller('game')
export class GameController {
  constructor(@Inject(GameProvider) private gameProvider: GameProvider) {}

  @Post()
  @HttpCode(ResponseStatus.CREATED)
  public async save(
    @Req() { user },
    @Body() createDto: GameResultCreateDto,
  ): Promise<HttpResponseFilter<GameResultModel>> {
    createDto.user_id = user.id;
    return HttpResponseFilter.response<GameResultModel>(
      await this.gameProvider.save(createDto),
      ResponseStatus.CREATED,
    );
  }

  @Get(':metricId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getByMetric(
    @Req() { user },
    @Param('metricId') metricId: number,
  ): Promise<HttpResponseFilter<GameResultModel[]>> {
    return HttpResponseFilter.response<GameResultModel[]>(
      await this.gameProvider.getAll({ userId: user.id, metricId }),
      ResponseStatus.SUCCESS,
    );
  }
}
