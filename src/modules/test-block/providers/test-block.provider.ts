import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TestBlockModel } from '../models/test-block.model';
import { TestBlockCreateDto } from '../dtos/test-block-create.dto';
import { TransactionUtil } from '../../../utils/TransactionUtil';
import { Sequelize } from 'sequelize-typescript';
import { ModelNotFoundException } from '../../../exceptions/model-not-found.exception';
import { TestModel } from '../../test/models/test.model';

@Injectable()
export class TestBlockProvider {
  constructor(
    @InjectModel(TestBlockModel) private testBlockModel: TestBlockModel,
    private sequelize: Sequelize,
  ) {}

  public async create(
    createDto: TestBlockCreateDto[],
  ): Promise<TestBlockModel[]> {
    const records = [];
    createDto.map((el) => records.push({ ...el }));
    return await Promise.all(
      records.map(async (record) => {
        return await TestBlockModel.create(
          record,
          TransactionUtil.getHost(),
        ).catch(() => {
          throw new ModelNotFoundException(TestModel, record.test_id);
        });
      }),
    )
      .then((res) => res)
      .catch((err) => {
        throw err;
      });
  }

  public async exclude(testId: number, blockId: number): Promise<boolean> {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    return (
      (await TestBlockModel.destroy({
        where: {
          block_id: blockId,
          test_id: testId,
        },
        ...TransactionUtil.getHost(),
      }).then((res) => {
        if (!isPropagate) TransactionUtil.commit();
        return res;
      })) > 0
    );
  }

  public async removeAllRelations(
    testId: number = 0,
    blocks: number[] = null,
  ): Promise<boolean> {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    let whereClause = {};
    if (testId != 0) {
      whereClause['test_id'] = testId;
    }
    if (blocks) {
      whereClause['block_id'] = blocks;
    }
    return (
      (await TestBlockModel.destroy({
        where: whereClause,
        ...TransactionUtil.getHost(),
      })
        .then((res) => {
          if (!isPropagate) TransactionUtil.commit();
          return res;
        })
        .catch((err) => {
          if (!isPropagate) TransactionUtil.rollback();
          throw err;
        })) > 0
    );
  }

  // public async getBlocks(testId: number): Promise<number[]> {
  //   return (await TestBlockModel.findAll({
  //     where: {
  //       test_id: testId
  //     }
  //   })).map(el => el.block_id);
  // }

  public async getTests(blockId: number): Promise<number[]> {
    return (
      await TestBlockModel.findAll({
        where: {
          block_id: blockId,
        },
      })
    ).map((el) => el.test_id);
  }

  async test() {
    await TestBlockModel.update(
      {
        test_id: 1,
      },
      {
        where: {
          id: 3891280391,
        },
        ...TransactionUtil.getHost(),
      },
    );
    throw new Error('test error');
  }
}
