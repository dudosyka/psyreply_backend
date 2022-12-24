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
import { BlockGroupStatOutputDto, BlockStatOutputDto } from "../dto/block-stat-output.dto";
import { BlockStatDto } from "../dto/block-stat.dto";
import { GroupBlockStatModel } from "../models/group-block-stat.model";
import { GroupModel } from "../../company/models/group.model";
import { UserModel } from "../../user/models/user.model";
import { TransactionUtil } from "../../../utils/TransactionUtil";

@Injectable()
export class ResultProvider {
  constructor(
    @Inject(TestProvider) private testProvider: TestProvider,
    @Inject(BlockProvider) private blockProvider: BlockProvider,
    @Inject(CompanyProvider) private companyProvider: CompanyProvider,
    private sequelize: Sequelize
  ) {
  }

  private async checkApproved(block: BlockModel, resultData: ResultCreateDto): Promise<boolean> {
    if (!block)
      return false;
    return (resultData.time_on_pass <= block.time);
  }

  public async pass(userId: number, blockId: number, week: number, passDto: ResultCreateDto): Promise<ResultModel> {

    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction())
    }

    const data: TestResultDto[] = [];

    await Promise.all(passDto.tests.map(async test => {
      const res = await this.testProvider.pass(test).catch(err => {
        if (!isPropagate)
          TransactionUtil.rollback()
        throw err;
      });
      if (res)
        data.push(res);
    }));
    const blockModel = await this.blockProvider.getOne(blockId, true).then(res => res).catch(err => {
      if (!isPropagate)
        TransactionUtil.rollback()
      throw err;
    });
    let block_title = "";
    let company_title = "";
    if (blockModel) {
      block_title = blockModel.name;
      const companyModel = await this.companyProvider.getOne(blockModel.company_id);
      if (companyModel)
        company_title = companyModel.name;
    }

    let dataMetrics = {}
    data.map(el => {
      if (dataMetrics[el.metric_id]) {
        dataMetrics[el.metric_id].push(el.value)
      } else {
        dataMetrics[el.metric_id] = [ el.value ]
      }
    });
    const newData = [];
    Object.keys(dataMetrics).map(el => {
      let sum = 0;
      dataMetrics[el].forEach(el => {
        sum += parseInt(el)
      });
      newData.push(
          {
            metric_id: parseInt(el),
            value: sum
          }
      );
    });

    const resultData = {
      user_id: userId,
      block_id: blockId,
      block_title,
      company_title,
      week,
      time_on_pass: passDto.time_on_pass,
      approved: await this.checkApproved(blockModel ? blockModel : null, passDto),
      data: JSON.stringify(newData),
      company_id: blockModel ? blockModel.company_id : null
    }

    return await ResultModel.create(resultData, TransactionUtil.getHost()).then(res => {
      if (!isPropagate)
        TransactionUtil.commit();
      return res;
    }).catch(err => {
      if (!isPropagate)
        TransactionUtil.rollback();
      throw err;
    });

  }

  public async getResults(filterDto: ResultFitlerDto): Promise<ResultModel[]> {
    const { createdAt, ...filter } = filterDto.filters;
    const { group_id, ...filters } = filter;
    const results = await ResultModel.findAll({
      where: {
        ...filters
      },
      order: [
        ['id', 'DESC']
      ],
      include: [BlockModel, CompanyModel, { model: UserModel, include: [ GroupModel ], ...(group_id ? ({ where: { group_id: group_id } }) : ({})) }]
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

  private async resultsByMetrics(models: ResultModel[], parted: boolean = false): Promise<ResultClientOutputDto> {
    const result = {
      metrics: {},
      part: parted
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

  public async getResultsClient(userId: number, last: boolean = false): Promise<ResultClientOutputDto> {
    const models = await this.getResults({ filters: { user_id: userId } });
    if (last) {
      return await this.resultsByMetrics([ models[models.length - 1] ], last);
    }
    return await this.resultsByMetrics(models, last)
  }

  public async update(resultId: number, updateDto: ResultUpdateDto): Promise<ResultModel> {
    const resModel = await ResultModel.findOne({
      where: {
        id: resultId
      }
    });

    if (!resModel)
      throw new ModelNotFoundException(ResultModel, resultId);

    if (updateDto.newData)
      resModel.data = JSON.stringify(updateDto.newData);
    if (updateDto.approved != null)
      resModel.approved = updateDto.approved
    await resModel.save();
    return resModel;
  }

  private async getGroupStat(group: GroupModel, results: ResultModel[]): Promise<BlockGroupStatOutputDto> {
    const approved = results.filter(el => el.approved);
    const allGroup = await GroupModel.findOne({
      where: {
        id: group.id
      },
      include: [UserModel]
    });

    const percent = Math.round((approved.length / allGroup.users.length)*100);

    const resultsByMetric = await this.resultsByMetrics(approved);
    const group_result = Object.keys(resultsByMetric).map(el => {
      const metric = resultsByMetric[el];
      let metric_id = 0;
      let value = 0;

      Object.keys(metric).map(id => {
        metric_id = parseInt(id);
        let sum = 0;
        metric[id].values.forEach(el => sum += el)
        if (sum)
          value = sum / metric[id].values.length;
      })

      return {
        metric_id,
        value
      }
    })

    return {
      group,
      percent,
      group_result
    }
  }

  public async calculateBlockStat(blockStatDto: BlockStatDto): Promise<BlockStatOutputDto> {
    const results = await this.getResults({ filters: { week: blockStatDto.week, block_id: blockStatDto.blockId } });

    let group_results = {};
    results.map(el => {
      const group = el.user.group;
      if (group_results[group.id]) {
        group_results[group.id].results.push(el)
      } else {
        group_results[group.id] = {
          group: el.user.group,
          results: [ el ]
        };
      }
    });

    const groupsResult = await Promise.all(Object.values(group_results).map(async (el: { group: GroupModel, results: ResultModel[] }) => {
      return await this.getGroupStat(el.group, el.results);
    }));

    return {
      allResults: results,
      groupsResult
    }
  }

  public async saveBlockStat(blockStatDto: BlockStatDto): Promise<any> {
    const stat = await this.calculateBlockStat(blockStatDto);
    return await Promise.all(stat.groupsResult.map(async groupStat => {
      return GroupBlockStatModel.create({
        data: JSON.stringify(groupStat.group_result),
        percent: groupStat.percent,
        week: blockStatDto.week,
        company_id: groupStat.group.company_id,
        group_id: groupStat.group.id,
        block_id: blockStatDto.blockId
      });
    }));
  }
}
