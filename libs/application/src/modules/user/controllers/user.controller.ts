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
  ResponseFilter,
  ResponseStatus,
} from '../../../filters/response.filter';

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
  ): Promise<ResponseFilter<UserModel[]>> {
    return ResponseFilter.response<UserModel[]>(
      await this.userProvider.getAll(filter, req.user.companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':jbId/assign')
  @HttpCode(ResponseStatus.SUCCESS)
  public async assignUser(
    @Param('jbId') userId: number,
  ): Promise<ResponseFilter<string>> {
    return ResponseFilter.response<string>(
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
  ): Promise<ResponseFilter<{ linkdb: string }>> {
    return ResponseFilter.response<{ linkdb: string }>(
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
  ): Promise<ResponseFilter<string>> {
    return ResponseFilter.response<string>(
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
  ): Promise<ResponseFilter<null>> {
    await this.userProvider.moveToCompany(userId, companyId);
    return ResponseFilter.response<null>(null, ResponseStatus.NO_CONTENT);
  }
}
