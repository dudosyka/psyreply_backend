import { Controller, Delete, HttpCode, Inject, Param } from '@nestjs/common';
import { DistributionProvider } from '@app/application/modules/distribution/providers/distribution.provider';
import { ResponseStatus } from '@app/application/filters/http-response.filter';

@Controller('distribution-block')
export class DistributionBlockController {
  constructor(
    @Inject(DistributionProvider)
    private distributionProvider: DistributionProvider,
  ) {}

  @Delete(':id')
  @HttpCode(ResponseStatus.NO_CONTENT)
  public async remove(@Param('id') id: number): Promise<void> {
    await this.distributionProvider.removeBlock(id);
  }
}
