import { IsString } from 'class-validator';

export default class CreateMetricDto {
  @IsString({
    message: 'name must be STRING',
  })
  name: string;

  @IsString({
    message: 'description must be STRING',
  })
  description: string;
}
