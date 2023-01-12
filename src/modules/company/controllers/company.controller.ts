import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AdminGuard } from "../../../guards/admin.guard";
import { CompanyProvider } from "../providers/company.provider";
import { CompanyModel } from "../models/company.model";
import { CompanyCreateDto } from "../dtos/company-create.dto";
import { CompanyUpdateDto } from "../dtos/company-update.dto";
import { GroupModel } from "../models/group.model";
import { GroupCreateDto } from "../dtos/group-create.dto";
import { GroupUpdateDto } from "../dtos/group-update.dto";
import { ResponseFilter, ResponseStatus } from "../../../filters/response.filter";

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("company")
export class CompanyController {
  constructor(
    @Inject(CompanyProvider) private companyProvider: CompanyProvider
  ) {
  }

  @Post()
  @HttpCode(ResponseStatus.CREATED)
  public async create(@Body("company") createDto: CompanyCreateDto): Promise<ResponseFilter<CompanyModel>> {
    return ResponseFilter.response<CompanyModel>(await this.companyProvider.create(createDto, createDto.inputBlocks), ResponseStatus.CREATED);
  }

  @Get()
  @HttpCode(ResponseStatus.SUCCESS)
  public async getAll(): Promise<ResponseFilter<CompanyModel[]>> {
    return ResponseFilter.response<CompanyModel[]>(await this.companyProvider.getAll(), ResponseStatus.SUCCESS);
  }

  @Get(":companyId")
  @HttpCode(ResponseStatus.SUCCESS)
  public async getOne(@Param("companyId") id: number): Promise<ResponseFilter<CompanyModel>> {
    return ResponseFilter.response<CompanyModel>(await this.companyProvider.getOne(id, true), ResponseStatus.SUCCESS);
  }

  @Patch(":companyId")
  @HttpCode(ResponseStatus.SUCCESS)
  public async update(@Param("companyId") id: number, @Body("company") updateDto: CompanyUpdateDto): Promise<ResponseFilter<CompanyModel>> {
    return ResponseFilter.response<CompanyModel>(await this.companyProvider.update(id, updateDto), ResponseStatus.SUCCESS);
  }

  @Delete(":companyId")
  @HttpCode(ResponseStatus.SUCCESS)
  public async delete(@Param("companyId") id: number): Promise<ResponseFilter<null>> {
    await this.companyProvider.remove(id);
    return ResponseFilter.response<null>(null, ResponseStatus.SUCCESS);
  }

  @Post(":companyId/append")
  @HttpCode(ResponseStatus.SUCCESS)
  public async appendBlocks(@Param("companyId") id: number, @Body("tests") tests: number[]): Promise<ResponseFilter<null>> {
    await this.companyProvider.appendBlocks(id, tests);
    return ResponseFilter.response<null>(null, ResponseStatus.SUCCESS)
  }

  @Post(":companyId/group")
  @HttpCode(ResponseStatus.SUCCESS)
  public async createGroup(@Param('companyId') companyId: number, @Body() groupCreateDto: GroupCreateDto): Promise<ResponseFilter<GroupModel>> {
    groupCreateDto.company_id = companyId;
    return ResponseFilter.response<GroupModel>(await this.companyProvider.createGroup(groupCreateDto), ResponseStatus.SUCCESS);
  }

  @Get(":companyId/group")
  @HttpCode(ResponseStatus.SUCCESS)
  public async getGroups(@Param('companyId') companyId: number): Promise<ResponseFilter<GroupModel[]>> {
    return ResponseFilter.response<GroupModel[]>(await this.companyProvider.getGroups(companyId), ResponseStatus.SUCCESS);
  }

  @Get('group/:groupId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getGroup(@Param("groupId") groupId: number): Promise<ResponseFilter<GroupModel>> {
    return ResponseFilter.response<GroupModel>(await this.companyProvider.getGroup(groupId), ResponseStatus.SUCCESS);
  }

  @Delete('group/:groupId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async removeGroup(@Param('groupId') groupId: number): Promise<ResponseFilter<null>> {
    await this.companyProvider.removeGroup(groupId);
    return ResponseFilter.response<null>(null, ResponseStatus.SUCCESS);
  }

  @Patch('group/:groupId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async updateGroup(@Param('groupId') groupId: number, @Body() groupUpdateDto: GroupUpdateDto): Promise<ResponseFilter<null>> {
    groupUpdateDto.id = groupId;
    await this.companyProvider.updateGroup(groupUpdateDto);
    return ResponseFilter.response<null>(null, ResponseStatus.SUCCESS);
  }

  @Delete('group/:groupId/user')
  @HttpCode(ResponseStatus.SUCCESS)
  public async removeUserFromGroup(@Param('groupId') groupId: number, @Body('users') users: number[]): Promise<ResponseFilter<null>> {
    await this.companyProvider.removeUsersFromGroup(users);
    return ResponseFilter.response<null>(null, ResponseStatus.SUCCESS);
  }

  @Post('group/:groupId/user/:userId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async appendUser(@Param('groupId') groupId: number, @Param('userId') userId: number): Promise<ResponseFilter<null>> {
    await this.companyProvider.appendUser(groupId, userId);
    return ResponseFilter.response<null>(null, ResponseStatus.SUCCESS);
  }
}
