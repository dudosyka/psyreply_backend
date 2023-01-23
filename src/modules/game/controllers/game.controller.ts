import {
  Body,
  Controller,
  Get,
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

@UseGuards(JwtAuthGuard, UserBlockGuard)
@Controller('game')
export class GameController {
  constructor(@Inject(GameProvider) private gameProvider: GameProvider) {}

  @Post()
  public async save(
    @Req() { user },
    @Body() createDto: GameResultCreateDto,
  ): Promise<GameResultModel> {
    createDto.user_id = user.id;
    return await this.gameProvider.save(createDto);
  }

  @Get(':metricId')
  public async getByMetric(
    @Req() { user },
    @Param('metricId') metricId: number,
  ): Promise<GameResultModel[]> {
    return await this.gameProvider.getAll(user.id, metricId);
  }
}
