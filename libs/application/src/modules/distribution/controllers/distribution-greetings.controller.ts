import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  HttpResponseFilter,
  ResponseStatus,
} from '@app/application/filters/http-response.filter';
import { DistributionModel } from '@app/application/modules/distribution/models/distribution.model';
import { DistributionGreetingsUpdateDto } from '@app/application/modules/distribution/dtos/distribution-greetings-update.dto';
import { DistributionProvider } from '@app/application/modules/distribution/providers/distribution.provider';
import { JwtAuthGuard } from '@app/application/guards/jwt-auth.guard';

@Controller('distribution/greetings')
@UseGuards(JwtAuthGuard)
export class DistributionGreetingsController {
  constructor(private distributionProvider: DistributionProvider) {}
  @Get('send/:chatId/:botId')
  @HttpCode(ResponseStatus.SUCCESS)
  async sendGreetings(
    @Param('chatId') chatId: string,
    @Param('botId') botId: string,
  ) {
    await this.distributionProvider.sendGreetings(
      parseInt(botId),
      parseInt(chatId),
    );
  }

  @Get('get')
  @HttpCode(ResponseStatus.SUCCESS)
  async getGreetings(@Req() req) {
    return HttpResponseFilter.response<DistributionModel>(
      await this.distributionProvider.getGreetings(req.user.companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @Patch(':id')
  @HttpCode(ResponseStatus.SUCCESS)
  async updateGreetings(
    @Param('id') distributionId: string,
    @Body() data: DistributionGreetingsUpdateDto,
  ): Promise<HttpResponseFilter<DistributionModel>> {
    return HttpResponseFilter.response(
      this.distributionProvider.updateGreetings(parseInt(distributionId), data),
      ResponseStatus.SUCCESS,
    );
  }
}
