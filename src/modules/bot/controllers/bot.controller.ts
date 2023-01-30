import { Controller, Get, HttpCode, Inject, Param, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AdminGuard } from "../../../guards/admin.guard";
import { ResponseFilter, ResponseStatus } from "../../../filters/response.filter";
import { UserModel } from "../../user/models/user.model";
import { BotProvider } from "../providers/bot.provider";
import { BotModel } from "../models/bot.model";
import { UserMessageModel } from "../models/user-message.model";

@Controller('bot')
@UseGuards(JwtAuthGuard, AdminGuard)
export class BotController {
  constructor(
    @Inject(BotProvider) private botProvider: BotProvider,
  ) {}

  @Get(':companyId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getBot(
    @Param('companyId') companyId: number
  ): Promise<ResponseFilter<BotModel[]>> {
    return ResponseFilter.response<BotModel[]>(await this.botProvider.getByCompany(companyId), ResponseStatus.SUCCESS);
  }

  @Get('')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getByToken(
    @Req() req
  ): Promise<ResponseFilter<BotModel[]>> {
    return ResponseFilter.response<BotModel[]>(await this.botProvider.getByUser(req.user.id), ResponseStatus.SUCCESS);
  }

  @Get(':botId/subs')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getSubscribers(
    @Param('botId') botId: number
  ): Promise<ResponseFilter<UserModel[]>> {
    return ResponseFilter.response<UserModel[]>(await this.botProvider.getSubscribers(botId), ResponseStatus.SUCCESS)
  }

  @Get(':botId/chat/:userId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getHistory(
    @Param('userId') userId: number,
    @Param('botId') botId: number
  ): Promise<ResponseFilter<UserMessageModel[]>> {
    return ResponseFilter.response<UserMessageModel[]>(await this.botProvider.getMessages(botId, userId), ResponseStatus.SUCCESS)
  }
}