import { DistributionMessageCreateDto } from '@app/application/modules/distribution/dtos/distribution-message-create.dto';
import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DistributionBlockCreateDto {
  @IsString()
  name: string;

  @ValidateNested({
    each: true,
  })
  @Type(() => DistributionMessageCreateDto)
  messages: DistributionMessageCreateDto[];

  @IsNumber()
  relative_id: number;
}
