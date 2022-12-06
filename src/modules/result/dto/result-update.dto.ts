type ResultDataType = {
  metric_id: number,
  value: number
}

export class ResultUpdateDto {
  approved: boolean;
  newData: ResultDataType[];
}
