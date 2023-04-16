import { IsString, MaxLength } from 'class-validator';

export default class CreateMetricDto {
  @IsString({
    message: 'name must be STRING',
  })
  @MaxLength(255)
  name: string;

  @IsString({
    message: 'description must be STRING',
  })
  description: string;
}
