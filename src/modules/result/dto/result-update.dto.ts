type ResultDataType = {
  metric_id: number,
  value: number
}

export class ResultUpdateDto {
  newData: ResultDataType[]
}
