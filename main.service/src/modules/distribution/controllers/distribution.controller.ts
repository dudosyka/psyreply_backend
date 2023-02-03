import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { ResponseFilter, ResponseStatus } from "../../../filters/response.filter";
import { DistributionCreateDto } from "../dtos/distribution-create.dto";

@Controller('distribution')
export class DistributionController {
  @Post('')
  @HttpCode(ResponseStatus.SUCCESS)
  async create(
    @Body() distributionDto: DistributionCreateDto
  ): Promise<ResponseFilter<void>> {
    return null;
  }
}