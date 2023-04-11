import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  HttpResponseFilter,
  ResponseStatus,
} from '../../../filters/http-response.filter';
import { DistributionCreateDto } from '../dtos/distribution-create.dto';
import { DistributionModel } from '@app/application/modules/distribution/models/distribution.model';
import { DistributionProvider } from '@app/application/modules/distribution/providers/distribution.provider';
import { JwtAuthGuard } from '@app/application/guards/jwt-auth.guard';
import { AdminGuard } from '@app/application/guards/admin.guard';

@Controller('distribution')
@UseGuards(JwtAuthGuard, AdminGuard)
export class DistributionController {
  constructor(
    @Inject(DistributionProvider)
    private distributionProvider: DistributionProvider,
  ) {}

  @Post('')
  @HttpCode(ResponseStatus.CREATED)
  async create(
    @Req() req,
    @Body() distributionDto: DistributionCreateDto,
  ): Promise<HttpResponseFilter<DistributionModel>> {
    return HttpResponseFilter.response<DistributionModel>(
      await this.distributionProvider.create(
        req.user.companyId,
        distributionDto,
      ),
      ResponseStatus.CREATED,
    );
  }

  @Get('')
  @HttpCode(ResponseStatus.SUCCESS)
  async getAll(@Req() req) {
    return HttpResponseFilter.response<DistributionModel[]>(
      await this.distributionProvider.getAll({
        where: { company_id: req.user.companyId },
      }),
      ResponseStatus.SUCCESS,
    );
  }

  @Get(':id')
  @HttpCode(ResponseStatus.SUCCESS)
  async getOne(
    @Param('id') id: number,
  ): Promise<HttpResponseFilter<DistributionModel>> {
    return HttpResponseFilter.response<DistributionModel>(
      await this.distributionProvider.getOne(id),
      ResponseStatus.SUCCESS,
    );
  }

  @Delete(':id')
  @HttpCode(ResponseStatus.NO_CONTENT)
  async remove(@Param('id') id: number): Promise<HttpResponseFilter<void>> {
    return HttpResponseFilter.response<void>(
      await this.distributionProvider.removeOne(id),
      ResponseStatus.NO_CONTENT,
    );
  }

  @Patch(':id')
  @HttpCode(ResponseStatus.SUCCESS)
  async update(
    @Param('id') id: number,
    @Req() req,
    @Body() data: DistributionCreateDto,
  ): Promise<HttpResponseFilter<DistributionModel>> {
    return HttpResponseFilter.response<DistributionModel>(
      await this.distributionProvider.update(id, req.user.companyId, data),
      ResponseStatus.SUCCESS,
    );
  }
}
