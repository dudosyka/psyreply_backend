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
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { CompanyProvider } from '../providers/company.provider';
import { CompanyModel } from '../models/company.model';
import { CompanyCreateDto } from '../dtos/company-create.dto';
import { CompanyUpdateDto } from '../dtos/company-update.dto';
import { GroupModel } from '../models/group.model';
import { GroupCreateDto } from '../dtos/group-create.dto';
import { GroupUpdateDto } from '../dtos/group-update.dto';
import {
  HttpResponseFilter,
  ResponseStatus,
} from '../../../filters/http-response.filter';
import { CompanyStatDto } from '../dtos/company-stat.dto';
import { GroupBlockStatModel } from '../../result/models/group-block-stat.model';
import { SuperAdminGuard } from '../../../guards/super.admin.guard';
import { AdminGuard } from '@app/application/guards/admin.guard';
import { DashboardAdminGuard } from '@app/application/guards/dashboard-admin.guard';

@UseGuards(JwtAuthGuard)
@Controller('company')
export class CompanyController {
  constructor(
    @Inject(CompanyProvider) private companyProvider: CompanyProvider,
  ) {}

  @UseGuards(SuperAdminGuard)
  @Post()
  @HttpCode(ResponseStatus.CREATED)
  public async create(
    @Body('company') createDto: CompanyCreateDto,
  ): Promise<HttpResponseFilter<CompanyModel>> {
    return HttpResponseFilter.response<CompanyModel>(
      await this.companyProvider.create(createDto, createDto.inputBlocks),
      ResponseStatus.CREATED,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Get()
  @HttpCode(ResponseStatus.SUCCESS)
  public async getAll(): Promise<HttpResponseFilter<CompanyModel[]>> {
    return HttpResponseFilter.response<CompanyModel[]>(
      await this.companyProvider.getAll(),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(AdminGuard)
  @Get('group')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getGroups(
    @Param('companyId') companyId: number,
    @Req() req,
  ): Promise<HttpResponseFilter<GroupModel[]>> {
    return HttpResponseFilter.response<GroupModel[]>(
      await this.companyProvider.getGroups(req.user.companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @Get(':companyId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getOne(
    @Param('companyId') id: number,
  ): Promise<HttpResponseFilter<CompanyModel>> {
    return HttpResponseFilter.response<CompanyModel>(
      await this.companyProvider.getOne(id, true),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Patch(':companyId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async update(
    @Param('companyId') id: number,
    @Body('company') updateDto: CompanyUpdateDto,
  ): Promise<HttpResponseFilter<CompanyModel>> {
    return HttpResponseFilter.response<CompanyModel>(
      await this.companyProvider.update(id, updateDto),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Delete(':companyId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async delete(
    @Param('companyId') id: number,
  ): Promise<HttpResponseFilter<null>> {
    await this.companyProvider.remove(id);
    return HttpResponseFilter.response<null>(null, ResponseStatus.SUCCESS);
  }

  @UseGuards(SuperAdminGuard)
  @Post(':companyId/append')
  @HttpCode(ResponseStatus.SUCCESS)
  public async appendBlocks(
    @Param('companyId') id: number,
    @Body('tests') blocks: number[],
  ): Promise<HttpResponseFilter<null>> {
    await this.companyProvider.appendBlocks(id, blocks);
    return HttpResponseFilter.response<null>(null, ResponseStatus.SUCCESS);
  }

  @UseGuards(AdminGuard)
  @Post('create/group')
  @HttpCode(ResponseStatus.SUCCESS)
  public async createGroup(
    @Req() req,
    @Body() groupCreateDto: GroupCreateDto,
  ): Promise<HttpResponseFilter<GroupModel>> {
    groupCreateDto.company_id = req.user.companyId;
    return HttpResponseFilter.response<GroupModel>(
      await this.companyProvider.createGroup(groupCreateDto),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(AdminGuard)
  @Get('group/:groupId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getGroup(
    @Param('groupId') groupId: number,
  ): Promise<HttpResponseFilter<GroupModel>> {
    return HttpResponseFilter.response<GroupModel>(
      await this.companyProvider.getGroup(groupId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(AdminGuard)
  @Delete('group/:groupId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async removeGroup(
    @Param('groupId') groupId: number,
  ): Promise<HttpResponseFilter<null>> {
    await this.companyProvider.removeGroup(groupId);
    return HttpResponseFilter.response<null>(null, ResponseStatus.SUCCESS);
  }

  @UseGuards(AdminGuard)
  @Patch('group/:groupId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async updateGroup(
    @Param('groupId') groupId: number,
    @Body() groupUpdateDto: GroupUpdateDto,
  ): Promise<HttpResponseFilter<null>> {
    groupUpdateDto.id = groupId;
    await this.companyProvider.updateGroup(groupUpdateDto);
    return HttpResponseFilter.response<null>(null, ResponseStatus.SUCCESS);
  }

  @UseGuards(AdminGuard)
  @Delete('group/:groupId/user')
  @HttpCode(ResponseStatus.SUCCESS)
  public async removeUserFromGroup(
    @Param('groupId') groupId: number,
    @Body('users') users: number[],
  ): Promise<HttpResponseFilter<null>> {
    await this.companyProvider.removeUsersFromGroup(users);
    return HttpResponseFilter.response<null>(null, ResponseStatus.SUCCESS);
  }

  @UseGuards(AdminGuard)
  @Post('group/:groupId/user/:userId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async appendUser(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ): Promise<HttpResponseFilter<null>> {
    await this.companyProvider.appendUser(groupId, userId);
    return HttpResponseFilter.response<null>(null, ResponseStatus.SUCCESS);
  }

  @UseGuards(DashboardAdminGuard)
  @Get('/dash/get')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getCurCompany(
    @Req() req,
  ): Promise<HttpResponseFilter<CompanyModel>> {
    return HttpResponseFilter.response(
      await this.companyProvider.getOneSimple(req.user.companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(DashboardAdminGuard)
  @Get('/stat/groups')
  @HttpCode(ResponseStatus.SUCCESS)
  public async checkToken(
    @Req() req,
  ): Promise<HttpResponseFilter<GroupModel[]>> {
    return HttpResponseFilter.response<GroupModel[]>(
      await this.companyProvider.getAvailableGroups(
        req.user.companyId,
        req.user.sharedGroups,
      ),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(DashboardAdminGuard)
  @Post('/stat/share')
  @HttpCode(ResponseStatus.SUCCESS)
  public async shareStat(
    @Req() req,
    @Body('groups') groups: number[],
  ): Promise<HttpResponseFilter<string>> {
    return HttpResponseFilter.response<string>(
      await this.companyProvider.shareStat(
        req.user.companyId,
        groups,
        req.user.sharedGroups,
      ),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(DashboardAdminGuard)
  @Get('/stat/:groupId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getStat(
    @Req() req,
    @Param('groupId') groupId: string,
  ): Promise<HttpResponseFilter<CompanyStatDto>> {
    return HttpResponseFilter.response<CompanyStatDto>(
      await this.companyProvider.getStatPart(
        req.user.companyId,
        parseInt(groupId),
        req.user.sharedGroups,
      ),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(DashboardAdminGuard)
  @Get('/stat/:groupId/all')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getStatAll(
    @Req() req,
    @Param('groupId') groupId: string,
  ): Promise<HttpResponseFilter<CompanyStatDto>> {
    return HttpResponseFilter.response<CompanyStatDto>(
      await this.companyProvider.getStatAll(
        req.user.companyId,
        parseInt(groupId),
        req.user.sharedGroups,
      ),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Patch('/stat/:statId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async updateStat(
    @Param('statId') statId: number,
    @Body('update') updateDto: { metric_id: number; value: number }[],
  ): Promise<HttpResponseFilter<GroupBlockStatModel>> {
    return HttpResponseFilter.response<GroupBlockStatModel>(
      await this.companyProvider.updateStat(statId, updateDto),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Delete('/stat/:statId')
  @HttpCode(ResponseStatus.NO_CONTENT)
  public async removeStatRow(
    @Param('statId') statId: number,
  ): Promise<HttpResponseFilter<null>> {
    await this.companyProvider.removeStatRow(statId);
    return HttpResponseFilter.response<null>(null, ResponseStatus.NO_CONTENT);
  }
}
