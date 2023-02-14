import { Body, Controller, Inject } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DistributionProvider } from '../providers/distribution.provider';
import { DistributionFilterDto } from '../dtos/distribution-filter.dto';

@Controller('distribution')
export class DistributionController {
  constructor(
    @Inject(DistributionProvider)
    private distributionProvider: DistributionProvider,
  ) {}
  @MessagePattern('getDistributions')
  public async getAll(@Body() filters: DistributionFilterDto) {
    return await this.distributionProvider.getAll(filters);
  }
}
