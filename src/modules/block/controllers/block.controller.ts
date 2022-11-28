import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AdminGuard } from "../../../guards/admin.guard";
import { BlockProvider } from "../providers/block.provider";
import { BlockModel } from "../models/block.model";
import { BlockFilterDto } from "../dtos/block-filter.dto";
import { BlockCreateDto } from "../dtos/block-create.dto";
import { BlockUpdateDto } from "../dtos/block-update.dto";
import { SearchFilter } from "../../../filters/search.filter";
import { ModelNotFoundException } from "../../../exceptions/model-not-found.exception";

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('block')
export class BlockController {
  constructor(
    @Inject(BlockProvider) private blockProvider: BlockProvider
  ) {}

  @Post('all')
  async getAll(@Body() filter: SearchFilter<BlockFilterDto>): Promise<BlockModel[]> {
    return this.blockProvider.getAll(filter.filters)
  }

  @Get(':blockId')
  async getOne(@Param('blockId') blockId: number): Promise<BlockModel> | never {
    const block = (await this.blockProvider.getOne(blockId))
    if (block)
      return block;
    else
      throw new ModelNotFoundException(BlockModel, blockId);
  }

  @Post()
  async create(@Body() createDto: BlockCreateDto): Promise<BlockModel> {
    return await this.blockProvider.create(createDto)
  }

  @Delete(':blockId')
  async remove(@Param('blockId') blockId: number): Promise<boolean> {
    return await this.blockProvider.remove(blockId);
  }

  @Patch(':blockId')
  async update(@Param('blockId') blockId: number, @Body() updateDto: BlockUpdateDto): Promise<BlockModel> {
    return await this.blockProvider.update(blockId, updateDto);
  }

  @Post(':blockId/copy/:companyId')
  async copyToCompany(@Param('blockId') blockId: number, @Param('companyId') companyId: number): Promise<BlockModel> {
    return await this.blockProvider.copyToCompany(blockId, companyId)
  }
}
