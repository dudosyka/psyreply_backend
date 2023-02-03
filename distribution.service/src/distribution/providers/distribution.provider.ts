import { Injectable } from '@nestjs/common';
import { DistributionFilterDto } from "../dtos/distribution-filter.dto";
import { DistributionModel } from "../models/distribution.model";

@Injectable()
export class DistributionProvider {
  async getAll(filters: DistributionFilterDto): Promise<DistributionModel[]> {
    return []
  }
}
