import { IsString } from "class-validator";

export class GroupCreateDto {
  company_id: number;

  @IsString({
    message: "name must be STRING"
  })
  name: string;
}
