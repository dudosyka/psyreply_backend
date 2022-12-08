import { InjectModel } from "@nestjs/sequelize";
import { GameMetricModel } from "../models/game-metric.model";
import { GameResultModel } from "../models/game-result.model";
import { TransactionUtil } from "../../../utils/TransactionUtil";
import { Sequelize } from "sequelize-typescript";
import { GameResultCreateDto } from "../dtos/game-result-create.dto";
import { UserModel } from "../../user/models/user.model";
import { ModelNotFoundException } from "../../../exceptions/model-not-found.exception";

export class GameProvider {
  constructor(
    @InjectModel(GameMetricModel) private gameMetricModel: GameMetricModel,
    @InjectModel(GameResultModel) private gameResultModel: GameResultModel,
    private sequelize: Sequelize
  ) {
  }

  public async save(createDto: GameResultCreateDto): Promise<GameResultModel> {

    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction())
    }

    const user = await UserModel.findOne({
      where: {
        id: createDto.user_id
      }
    });

    if (!user)
      throw new ModelNotFoundException(UserModel, createDto.user_id);


    const metric = await GameMetricModel.findOne({
      where: {
        id: createDto.metric_id
      }
    });

    if (!metric)
      throw new ModelNotFoundException(GameMetricModel, createDto.metric_id);

    return await GameResultModel.create({
      ...createDto
    }).then(res => {
      if (!isPropagate)
        TransactionUtil.commit();
      return res;
    });
  }

  public async getAll(userId: number, metricId: number) {
    return await GameResultModel.findAll({
      where: {
        user_id: userId,
        metric_id: metricId
      },
      include: [UserModel, GameMetricModel]
    })
  }
}
