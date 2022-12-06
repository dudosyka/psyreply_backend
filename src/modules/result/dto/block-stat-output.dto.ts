import { ResultModel } from "../models/result.model";
import { GroupModel } from "../../company/models/group.model";

export class BlockGroupStatOutputDto {
  group: GroupModel;
  percent: number;
  group_result: any;
}

export class BlockStatOutputDto {
  allResults: ResultModel[];
  groupsResult: BlockGroupStatOutputDto[]
}
