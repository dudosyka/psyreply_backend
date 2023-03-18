import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/application/guards/jwt-auth.guard';
import { AdminGuard } from '@app/application/guards/admin.guard';
import { UserProvider } from '../providers/user.provider';
import { AuthProvider } from '@app/application/modules/auth/providers/auth.provider';
import { UserBlockGuard } from '@app/application/guards/user-block.guard';
import { UserFilterDto } from '../dtos/user-filter.dto';
import { UserModel } from '../models/user.model';
import { BlockGuard } from '@app/application/guards/block.guard';
import {
  HttpResponseFilter,
  ResponseStatus,
} from '../../../filters/http-response.filter';

@Controller('user')
export class UserController {
  constructor(
    @Inject(UserProvider) private userProvider: UserProvider,
    @Inject(AuthProvider) private authProvider: AuthProvider,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  get(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('/all')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getAll(
    @Req() req,
    @Body() filter: UserFilterDto,
  ): Promise<HttpResponseFilter<UserModel[]>> {
    return HttpResponseFilter.response<UserModel[]>(
      await this.userProvider.getAll(filter, req.user.companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':jbId/assign')
  @HttpCode(ResponseStatus.SUCCESS)
  public async assignUser(
    @Param('jbId') userId: number,
  ): Promise<HttpResponseFilter<string>> {
    return HttpResponseFilter.response<string>(
      `https://client.psyreply.com/results/${await this.authProvider.assignUser(
        userId,
      )}`,
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(JwtAuthGuard, BlockGuard)
  @Get('/client/:jbId/assign')
  @HttpCode(ResponseStatus.SUCCESS)
  public async assignUserFromBot(
    @Param('jbId') jetBotId: number,
  ): Promise<HttpResponseFilter<{ linkdb: string }>> {
    return HttpResponseFilter.response<{ linkdb: string }>(
      {
        linkdb: `https://client.psyreply.com/results/${await this.authProvider.assignUser(
          jetBotId,
        )}`,
      },
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(JwtAuthGuard, UserBlockGuard)
  @Get('/assign')
  @HttpCode(ResponseStatus.SUCCESS)
  public async assignUserByUserBlockToken(
    @Req() req,
  ): Promise<HttpResponseFilter<string>> {
    return HttpResponseFilter.response<string>(
      `https://client.psyreply.com/results/${await this.authProvider.assignUserByUserBlock(
        req.user.id,
      )}`,
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':userId/move/:companyId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async moveToCompany(
    @Param('userId') userId: number,
    @Param('companyId') companyId: number,
  ): Promise<HttpResponseFilter<null>> {
    await this.userProvider.moveToCompany(userId, companyId);
    return HttpResponseFilter.response<null>(null, ResponseStatus.NO_CONTENT);
  }
}
