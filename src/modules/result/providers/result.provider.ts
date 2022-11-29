import { Inject, Injectable } from "@nestjs/common";
import { TestProvider } from "../../test/providers/test.provider";
import { BlockProvider } from "../../block/providers/block.provider";
import { Sequelize } from "sequelize-typescript";
import { ResultCreateDto } from "../dto/result-create.dto";
import { ResultModel } from "../models/result.model";
import { TestResultDto } from "../../test/dtos/test-result.dto";
import { ResultFitlerDto } from "../dto/result-fitler.dto";
import { ResultUpdateDto } from "../dto/result-update.dto";
import { ModelNotFoundException } from "../../../exceptions/model-not-found.exception";

@Injectable()
export class ResultProvider {
  constructor(
    @Inject(TestProvider) private testProvider: TestProvider,
    @Inject(BlockProvider) private blockProvider: BlockProvider,
    private sequelize: Sequelize
  ) {}

  public async pass(userId: number, blockId: number, passDto: ResultCreateDto): Promise<ResultModel> {
    return new Promise<ResultModel>(async (resolve, reject) => {
      await this.sequelize.transaction(async t => {
        const host = { transaction: t }
        const data: TestResultDto[] = [];
        await Promise.all(passDto.tests.map(async test => {
          const res = await this.testProvider.pass(test).catch(err => reject(err))
          if (res)
            data.push(res);
        }));
        const blockModel = await this.blockProvider.getOne(blockId, true).catch(err => reject(err));
        resolve(await ResultModel.create({
          user_id: userId,
          block_id: blockId,
          data: JSON.stringify(data),
          company_id: blockModel ? blockModel.company_id : null
        }, host));
      })
    })
  }

  public async getResults(filterDto: ResultFitlerDto): Promise<ResultModel[]> {
    const { createdAt, ...filter } = filterDto.filters;
    const results = await ResultModel.findAll({
      where: {
        ...filter
      }
    });
    if (createdAt) {
      return results.filter(el => {
        const date = `${el.createdAt.getFullYear()}-${(el.createdAt.getMonth() + 1)}-${el.createdAt.getDate()}`;
        return date == createdAt;
      })
    } else
      return results;
  }

  public async update(resultId: number, updateDto: ResultUpdateDto): Promise<ResultModel> {
    return new Promise<ResultModel>(async (resolve, reject) => {
      const resModel = await ResultModel.findOne({
        where: {
          id: resultId
        }
      });

      if (!resModel)
        reject(new ModelNotFoundException(ResultModel, resultId))

      resModel.data = JSON.stringify(updateDto);
      await resModel.save();
      resolve(resModel);
    })
  }
}
