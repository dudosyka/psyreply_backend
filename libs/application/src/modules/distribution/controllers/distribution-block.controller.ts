import {
  Controller,
  Delete,
  HttpCode,
  Inject,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DistributionProvider } from '@app/application/modules/distribution/providers/distribution.provider';
import { ResponseStatus } from '@app/application/filters/http-response.filter';
import { JwtAuthGuard } from '@app/application/guards/jwt-auth.guard';
import { AdminGuard } from '@app/application/guards/admin.guard';

@Controller('distribution-block')
@UseGuards(JwtAuthGuard, AdminGuard)
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
