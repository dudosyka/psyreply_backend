import { PartialType } from "@nestjs/mapped-types";
import { BlockCreateDto } from "./block-create.dto";

export class BlockUpdateDto extends PartialType(BlockCreateDto) {
}
