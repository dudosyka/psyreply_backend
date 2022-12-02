import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AdminGuard } from "../../../guards/admin.guard";
import { MetricProvider } from "../providers/metric.provider";
import { MetricModel } from "../models/metric.model";

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("metric")
export class MetricController {
  constructor(
    @Inject(MetricProvider) private metricProvider: MetricProvider
  ) {
  }

  @Get()
  public getAll(): Promise<MetricModel[]> {
    return this.metricProvider.getAll();
  }

}
