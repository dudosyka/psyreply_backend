import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { TestBlockModel } from "../models/test-block.model";
import { TestBlockCreateDto } from "../dtos/test-block-create.dto";
import { Transaction } from "sequelize";

@Injectable()
export class TestBlockProvider {
  constructor(
    @InjectModel(TestBlockModel) private testBlockModel: TestBlockModel
  ) {
  }

  public async create(createDto: TestBlockCreateDto[], host: { transaction: Transaction }): Promise<TestBlockModel[]> {
    const records = [];
    createDto.map(el => records.push({ ...el }))
    return await TestBlockModel.bulkCreate(records, host);
  }
}
