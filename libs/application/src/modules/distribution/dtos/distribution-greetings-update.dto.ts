import { DistributionBlockCreateDto } from '@app/application/modules/distribution/dtos/distribution-block-create.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DistributionGreetingsUpdateDto {
  @ValidateNested()
  @Type(() => DistributionBlockCreateDto)
  block: DistributionBlockCreateDto;
}
