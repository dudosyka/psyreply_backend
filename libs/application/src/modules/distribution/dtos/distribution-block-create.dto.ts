import { DistributionMessageCreateDto } from '@app/application/modules/distribution/dtos/distribution-message-create.dto';
import { IsNumber, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DistributionBlockCreateDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @ValidateNested({
    each: true,
  })
  @Type(() => DistributionMessageCreateDto)
  messages: DistributionMessageCreateDto[];

  @IsNumber()
  relative_id: number;
}
