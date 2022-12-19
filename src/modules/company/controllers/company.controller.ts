import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AdminGuard } from "../../../guards/admin.guard";
import { CompanyProvider } from "../providers/company.provider";
import { CompanyModel } from "../models/company.model";
import { CompanyCreateDto } from "../dtos/company-create.dto";
import { CompanyUpdateDto } from "../dtos/company-update.dto";
import { GroupModel } from "../models/group.model";
import { GroupCreateDto } from "../dtos/group-create.dto";
import { GroupUpdateDto } from "../dtos/group-update.dto";

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("company")
export class CompanyController {
  constructor(
    @Inject(CompanyProvider) private companyProvider: CompanyProvider
  ) {
  }

  @Post()
  public create(@Body("company") createDto: CompanyCreateDto): Promise<CompanyModel> {
    return this.companyProvider.create(createDto, createDto.inputBlocks);
  }

  @Get()
  public getAll(): Promise<CompanyModel[]> {
    return this.companyProvider.getAll();
  }

  @Get(":companyId")
  public getOne(@Param("companyId") id: number): Promise<CompanyModel> {
    return this.companyProvider.getOne(id, true);
  }

  @Patch(":companyId")
  public update(@Param("companyId") id: number, @Body("company") updateDto: CompanyUpdateDto): Promise<CompanyModel> {
    return this.companyProvider.update(id, updateDto);
  }

  @Delete(":companyId")
  public delete(@Param("companyId") id: number): Promise<boolean> {
    return this.companyProvider.remove(id);
  }

  @Post(":companyId/append")
  public appendBlocks(@Param("companyId") id: number, @Body("tests") tests: number[]): Promise<boolean> {
    return this.companyProvider.appendBlocks(id, tests);
  }

  @Post(":companyId/group")
  public async createGroup(@Param('companyId') companyId: number, @Body() groupCreateDto: GroupCreateDto): Promise<GroupModel> {
    groupCreateDto.company_id = companyId;
    return await this.companyProvider.createGroup(groupCreateDto);
  }

  @Get(":companyId/group")
  public async getGroups(@Param('companyId') companyId: number): Promise<GroupModel[]> {
    return await this.companyProvider.getGroups(companyId);
  }

  @Get('group/:groupId')
  public async getGroup(@Param("groupId") groupId: number): Promise<GroupModel> {
    return await this.companyProvider.getGroup(groupId);
  }

  @Delete('group/:groupId')
  public async removeGroup(@Param('groupId') groupId: number): Promise<boolean> {
    return await this.companyProvider.removeGroup(groupId);
  }

  @Patch('group/:groupId')
  public async updateGroup(@Param('groupId') groupId: number, @Body() groupUpdateDto: GroupUpdateDto): Promise<boolean> {
    groupUpdateDto.id = groupId;
    return await this.companyProvider.updateGroup(groupUpdateDto);
  }

  @Post('group/:groupId/user/:userId')
  public async appendUser(@Param('groupId') groupId: number, @Param('userId') userId: number): Promise<boolean> {
    return await this.companyProvider.appendUser(groupId, userId);
  }
}
