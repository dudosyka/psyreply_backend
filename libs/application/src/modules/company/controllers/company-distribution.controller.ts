import {
  Body,
  Controller,
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
} from '@app/application/filters/http-response.filter';
import { JwtAuthGuard } from '@app/application/guards/jwt-auth.guard';
import { AdminGuard } from '@app/application/guards/admin.guard';
import { BotModel } from '@app/application/modules/bot/models/bot.model';
import { BotProvider } from '@app/application/modules/bot/providers/bot.provider';
import { BotCreateDto } from '@app/application/modules/bot/dto/bot-create.dto';

@Controller('company-distribution')
@UseGuards(JwtAuthGuard, AdminGuard)
export class CompanyDistributionController {
  constructor(@Inject(BotProvider) private botProvider: BotProvider) {}

  @Get('/bot')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getCompanyBots(
    @Req() req,
  ): Promise<HttpResponseFilter<BotModel[]>> {
    return HttpResponseFilter.response<BotModel[]>(
      await this.botProvider.getAllByCompany(req.user.companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @Post('/bot')
  @HttpCode(ResponseStatus.CREATED)
  public async createBot(@Req() req, @Body() createDto: BotCreateDto) {
    createDto.company_id = req.user.companyId;
    return HttpResponseFilter.response<BotModel>(
      await this.botProvider.create(createDto),
      ResponseStatus.CREATED,
    );
  }

  @Patch('/bot/:botId')
  @HttpCode(ResponseStatus.CREATED)
  public async updateBot(
    @Req() req,
    @Param('botId') botId: number,
    @Body() updateDto: BotCreateDto,
  ) {
    updateDto.company_id = req.user.companyId;
    return HttpResponseFilter.response<BotModel>(
      await this.botProvider.update(updateDto, botId),
      ResponseStatus.CREATED,
    );
  }
}
