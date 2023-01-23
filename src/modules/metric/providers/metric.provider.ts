import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { MetricModel } from '../models/metric.model';
import CreateMetricDto from '../dto/create-metric.dto';

@Injectable()
export class MetricProvider {
  constructor(@InjectModel(MetricModel) private metricModel: MetricModel) {}

  getAll(): Promise<MetricModel[]> {
    return MetricModel.findAll();
  }

  async create(createDto: CreateMetricDto): Promise<MetricModel> {
    return await MetricModel.create({
      ...createDto,
    });
  }
}
