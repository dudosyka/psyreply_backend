import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MetricModel } from './models/metric.model';
import { MetricController } from './controllers/metric.controller';
import { MetricProvider } from './providers/metric.provider';

@Module({
  imports: [SequelizeModule.forFeature([MetricModel])],
  providers: [MetricProvider],
  controllers: [MetricController],
})
export class MetricModule {}
