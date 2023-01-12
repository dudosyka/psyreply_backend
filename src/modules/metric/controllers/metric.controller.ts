import { Body, Controller, Get, Inject, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AdminGuard } from "../../../guards/admin.guard";
import { MetricProvider } from "../providers/metric.provider";
import { MetricModel } from "../models/metric.model";
import CreateMetricDto from "../dto/create-metric.dto";
import { ResponseFilter, ResponseStatus } from "../../../filters/response.filter";

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("metric")
export class MetricController {
  constructor(
    @Inject(MetricProvider) private metricProvider: MetricProvider
  ) {
  }

  @Get()
  public async getAll(): Promise<ResponseFilter<MetricModel[]>> {
    return ResponseFilter.response<MetricModel[]>(await this.metricProvider.getAll(), ResponseStatus.SUCCESS);
  }

  @Post()
  public async create(@Body() createDto: CreateMetricDto): Promise<ResponseFilter<MetricModel>> {
    return ResponseFilter.response<MetricModel>(await this.metricProvider.create(createDto), ResponseStatus.CREATED);
  }
}
