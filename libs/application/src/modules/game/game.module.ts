import { Module } from '@nestjs/common';
import { GameController } from './controllers/game.controller';
import { GameProvider } from './providers/game.provider';
import { SequelizeModule } from '@nestjs/sequelize';
import { GameResultModel } from './models/game-result.model';
import { GameMetricModel } from './models/game-metric.model';

@Module({
  imports: [SequelizeModule.forFeature([GameResultModel, GameMetricModel])],
  providers: [GameProvider],
  controllers: [GameController],
  exports: [
    GameProvider,
    SequelizeModule.forFeature([GameResultModel, GameMetricModel]),
  ],
})
export class GameModule {}
