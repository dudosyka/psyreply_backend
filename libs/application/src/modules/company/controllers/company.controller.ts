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
  ResponseFilter,
  ResponseStatus,
} from '../../../filters/response.filter';
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
  ): Promise<ResponseFilter<CompanyModel>> {
    return ResponseFilter.response<CompanyModel>(
      await this.companyProvider.create(createDto, createDto.inputBlocks),
      ResponseStatus.CREATED,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Get()
  @HttpCode(ResponseStatus.SUCCESS)
  public async getAll(): Promise<ResponseFilter<CompanyModel[]>> {
    return ResponseFilter.response<CompanyModel[]>(
      await this.companyProvider.getAll(),
      ResponseStatus.SUCCESS,
    );
  }

  @Get(':companyId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getOne(
    @Param('companyId') id: number,
  ): Promise<ResponseFilter<CompanyModel>> {
    return ResponseFilter.response<CompanyModel>(
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
  ): Promise<ResponseFilter<CompanyModel>> {
    return ResponseFilter.response<CompanyModel>(
      await this.companyProvider.update(id, updateDto),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Delete(':companyId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async delete(
    @Param('companyId') id: number,
  ): Promise<ResponseFilter<null>> {
    await this.companyProvider.remove(id);
    return ResponseFilter.response<null>(null, ResponseStatus.SUCCESS);
  }

  @UseGuards(SuperAdminGuard)
  @Post(':companyId/append')
  @HttpCode(ResponseStatus.SUCCESS)
  public async appendBlocks(
    @Param('companyId') id: number,
    @Body('tests') blocks: number[],
  ): Promise<ResponseFilter<null>> {
    await this.companyProvider.appendBlocks(id, blocks);
    return ResponseFilter.response<null>(null, ResponseStatus.SUCCESS);
  }

  @UseGuards(AdminGuard)
  @Post(':companyId/group')
  @HttpCode(ResponseStatus.SUCCESS)
  public async createGroup(
    @Param('companyId') companyId: number,
    @Body() groupCreateDto: GroupCreateDto,
  ): Promise<ResponseFilter<GroupModel>> {
    groupCreateDto.company_id = companyId;
    return ResponseFilter.response<GroupModel>(
      await this.companyProvider.createGroup(groupCreateDto),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(AdminGuard)
  @Get(':companyId/group')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getGroups(
    @Param('companyId') companyId: number,
  ): Promise<ResponseFilter<GroupModel[]>> {
    return ResponseFilter.response<GroupModel[]>(
      await this.companyProvider.getGroups(companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(AdminGuard)
  @Get('group/:groupId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getGroup(
    @Param('groupId') groupId: number,
  ): Promise<ResponseFilter<GroupModel>> {
    return ResponseFilter.response<GroupModel>(
      await this.companyProvider.getGroup(groupId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(AdminGuard)
  @Delete('group/:groupId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async removeGroup(
    @Param('groupId') groupId: number,
  ): Promise<ResponseFilter<null>> {
    await this.companyProvider.removeGroup(groupId);
    return ResponseFilter.response<null>(null, ResponseStatus.SUCCESS);
  }

  @UseGuards(AdminGuard)
  @Patch('group/:groupId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async updateGroup(
    @Param('groupId') groupId: number,
    @Body() groupUpdateDto: GroupUpdateDto,
  ): Promise<ResponseFilter<null>> {
    groupUpdateDto.id = groupId;
    await this.companyProvider.updateGroup(groupUpdateDto);
    return ResponseFilter.response<null>(null, ResponseStatus.SUCCESS);
  }

  @UseGuards(AdminGuard)
  @Delete('group/:groupId/user')
  @HttpCode(ResponseStatus.SUCCESS)
  public async removeUserFromGroup(
    @Param('groupId') groupId: number,
    @Body('users') users: number[],
  ): Promise<ResponseFilter<null>> {
    await this.companyProvider.removeUsersFromGroup(users);
    return ResponseFilter.response<null>(null, ResponseStatus.SUCCESS);
  }

  @UseGuards(AdminGuard)
  @Post('group/:groupId/user/:userId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async appendUser(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ): Promise<ResponseFilter<null>> {
    await this.companyProvider.appendUser(groupId, userId);
    return ResponseFilter.response<null>(null, ResponseStatus.SUCCESS);
  }

  @UseGuards(DashboardAdminGuard)
  @Get('/stat/groups')
  @HttpCode(ResponseStatus.SUCCESS)
  public async checkToken(@Req() req): Promise<ResponseFilter<GroupModel[]>> {
    return ResponseFilter.response<GroupModel[]>(
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
  ): Promise<ResponseFilter<string>> {
    return ResponseFilter.response<string>(
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
  ): Promise<ResponseFilter<CompanyStatDto>> {
    return ResponseFilter.response<CompanyStatDto>(
      await this.companyProvider.getStat(
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
  ): Promise<ResponseFilter<GroupBlockStatModel>> {
    return ResponseFilter.response<GroupBlockStatModel>(
      await this.companyProvider.updateStat(statId, updateDto),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Delete('/stat/:statId')
  @HttpCode(ResponseStatus.NO_CONTENT)
  public async removeStatRow(
    @Param('statId') statId: number,
  ): Promise<ResponseFilter<null>> {
    await this.companyProvider.removeStatRow(statId);
    return ResponseFilter.response<null>(null, ResponseStatus.NO_CONTENT);
  }
}
