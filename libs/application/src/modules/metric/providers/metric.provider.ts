import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { MetricModel } from '../models/metric.model';
import CreateMetricDto from '../dto/create-metric.dto';
import { BaseProvider } from '../../base/base.provider';

@Injectable()
export class MetricProvider extends BaseProvider<MetricModel> {
  constructor(@InjectModel(MetricModel) private metricModel: MetricModel) {
    super(MetricModel);
  }

  getAll(): Promise<MetricModel[]> {
    return MetricModel.findAll();
  }

  async create(createDto: CreateMetricDto): Promise<MetricModel> {
    return await MetricModel.create({
      ...createDto,
      description: 'Тестовое описание метрики',
    });
  }
}
