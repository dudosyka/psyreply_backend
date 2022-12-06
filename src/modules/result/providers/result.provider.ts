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
import { CompanyProvider } from "../../company/providers/company.provider";
import { BlockModel } from "../../block/models/block.model";
import { CompanyModel } from "../../company/models/company.model";
import { ResultClientOutputDto } from "../dto/result-client-output.dto";
import { MetricModel } from "../../metric/models/metric.model";

@Injectable()
export class ResultProvider {
  constructor(
    @Inject(TestProvider) private testProvider: TestProvider,
    @Inject(BlockProvider) private blockProvider: BlockProvider,
    @Inject(BlockProvider) private companyProvider: CompanyProvider,
    private sequelize: Sequelize
  ) {
  }

  private async checkApproved(block: BlockModel, resultData: ResultCreateDto): Promise<boolean> {
    if (!block)
      return false;
    return (resultData.time_on_pass <= block.time);
  }

  public async pass(userId: number, blockId: number, passDto: ResultCreateDto): Promise<ResultModel> {
    return new Promise<ResultModel>(async (resolve, reject) => {
      await this.sequelize.transaction(async t => {
        const host = { transaction: t };
        const data: TestResultDto[] = [];
        await Promise.all(passDto.tests.map(async test => {
          const res = await this.testProvider.pass(test).catch(err => reject(err));
          if (res)
            data.push(res);
        }));
        const blockModel = await this.blockProvider.getOne(blockId, true).then(res => res).catch(err => reject(err));
        let block_title = "";
        let company_title = "";
        if (blockModel) {
          block_title = blockModel.name;
          const companyModel = await this.companyProvider.getOne(blockModel.company_id);
          if (companyModel)
            company_title = companyModel.name;
        }
        resolve(await ResultModel.create({
          user_id: userId,
          block_id: blockId,
          block_title,
          company_title,
          approved: this.checkApproved(blockModel ? blockModel : null, passDto),
          data: JSON.stringify(data),
          company_id: blockModel ? blockModel.company_id : null
        }, host));
      });
    });
  }

  public async getResults(filterDto: ResultFitlerDto): Promise<ResultModel[]> {
    const { createdAt, ...filter } = filterDto.filters;
    const results = await ResultModel.findAll({
      where: {
        ...filter
      },
      include: [BlockModel, CompanyModel]
    });
    if (createdAt) {
      return results.filter(el => {
        const date = `${el.createdAt.getFullYear()}-${(el.createdAt.getMonth() + 1)}-${el.createdAt.getDate()}`;
        return date == createdAt;
      });
    } else {
      return results;
    }
  }

  public async getResultsClient(userId: number): Promise<ResultClientOutputDto> {
    const models = await this.getResults({ filters: { user_id: userId } });
    const result = {
      metrics: {}
    };

    await Promise.all(models.map(async el => {
      const data = JSON.parse(el.data);
      await Promise.all(data.map(async metric => {
        const metricModel = await MetricModel.findOne({
          where: {
            id: metric["metric_id"]
          }
        });
        if (metricModel) {
          if (result.metrics[metricModel.id]) {
            result.metrics[metricModel.id].values.push(metric.value)
          } else {
            result.metrics[metricModel.id] = {
              name: metricModel.name,
              values: [metric.value]
            }
          }
        }
      }));

    }));

    return result;
  }

  public async update(resultId: number, updateDto: ResultUpdateDto): Promise<ResultModel> {
    const resModel = await ResultModel.findOne({
      where: {
        id: resultId
      }
    });

    if (!resModel)
      throw new ModelNotFoundException(ResultModel, resultId);

    resModel.data = JSON.stringify(updateDto);
    await resModel.save();
    return resModel;
  }
}
