import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { MetricModel } from "../models/metric.model";

@Injectable()
export class MetricProvider {
  constructor(
    @InjectModel(MetricModel) private metricModel: MetricModel
  ) {}

  getAll(): Promise<MetricModel[]> {
    return MetricModel.findAll();
  }
}
