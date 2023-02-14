import { HttpException } from '@nestjs/common';

export class ModelNotFoundException<T> extends HttpException {
  constructor(model: T, id: number) {
    const regex = /(class)\s(\w+)\s(extends).*/;
    let body;
    try {
      const modelName = model.toString().match(regex)[2];
      body = JSON.stringify({
        id,
        model,
        text: `${modelName} with ${id} not found`,
      });
    } catch (err) {
      body = JSON.stringify({
        id,
        model,
        text: `${model} with ${id} not found`,
      });
    }
    super(body, 404);
  }
}
