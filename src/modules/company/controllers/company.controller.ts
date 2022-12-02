import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AdminGuard } from "../../../guards/admin.guard";
import { CompanyProvider } from "../providers/company.provider";
import { CompanyModel } from "../models/company.model";
import { CompanyCreateDto } from "../dtos/company-create.dto";
import { CompanyUpdateDto } from "../dtos/company-update.dto";

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
    return this.companyProvider.getOne(id);
  }

  @Patch(":companyId")
  public update(@Param("companyId") id: number, @Body("company") updateDto: CompanyUpdateDto): Promise<boolean> {
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
}
