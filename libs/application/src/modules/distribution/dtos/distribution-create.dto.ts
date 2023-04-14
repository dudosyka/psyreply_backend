import { DistributionBlockCreateDto } from '@app/application/modules/distribution/dtos/distribution-block-create.dto';
import {
  IsNumber,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DistributionCreateDto {
  @IsString()
  name: string;

  @IsNumber({}, { each: true })
  recipients: number[];

  @IsNumber()
  @Min(0)
  @Max(1)
  onetime: boolean;

  @IsNumber()
  day_period: number;

  @IsString()
  @Matches('([0-9]{2}:){2}[0-9]{2}')
  send_time: string;

  @ValidateNested({
    each: true,
  })
  @Type(() => DistributionBlockCreateDto)
  blocks: DistributionBlockCreateDto[];
}
