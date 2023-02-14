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

  async create(createDto: CreateMetricDto): Promise<MetricModel> {
    return await MetricModel.create({
      ...createDto,
    });
  }

  async markRemove(query): Promise<void> {
    const metric = await this.getOne(query);
    metric.update({
      deleted: true,
    });
  }
}
