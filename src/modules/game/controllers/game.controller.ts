import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { UserBlockGuard } from "../../../guards/user-block.guard";
import { GameResultModel } from "../models/game-result.model";
import { GameProvider } from "../providers/game.provider";
import { GameResultCreateDto } from "../dtos/game-result-create.dto";
import { ResponseFilter, ResponseStatus } from "../../../filters/response.filter";

@UseGuards(JwtAuthGuard, UserBlockGuard)
@Controller('game')
export class GameController {
  constructor(
    @Inject(GameProvider) private gameProvider: GameProvider
  ) {
  }

  @Post()
  public async save(@Req() { user }, @Body() createDto: GameResultCreateDto): Promise<ResponseFilter<GameResultModel>> {
    createDto.user_id = user.id;
    return ResponseFilter.response<GameResultModel>(await this.gameProvider.save(createDto), ResponseStatus.CREATED);
  }

  @Get(":metricId")
  public async getByMetric(@Req() { user }, @Param('metricId') metricId: number): Promise<ResponseFilter<GameResultModel[]>> {
    return ResponseFilter.response<GameResultModel[]>(await this.gameProvider.getAll(user.id, metricId), ResponseStatus.SUCCESS);
  }
}
