import { Injectable } from "@nestjs/common";

export enum OperandType {
  VARIABLE,
  CONST
}

type Operand = {
  sign: number,
  type: OperandType
  value: number
}

export type ShlyapaMarkup = {
  item: Operand
  sum: Operand | null,
  composition: Operand | null
}

@Injectable()
export class ShlyapaMarkupUtil {
  static validate_pattern = '^(\\+((\\$\\d+)|(\\(((\\d+)|(\\$\\d+))[+*-]\\$\\d+\\))|(\\(\\-?\\$\\d+\\))))+$'
  static parse_pattern = '((\\$\\d+)|(\\(((\\d+)|(\\$\\d+))[+*-]\\$\\d+\\))|(\\(\\-?\\$\\d+\\)))'
  private static parse_item = new RegExp('(\\d+)|(\\$\\d+)', 'gm')
  private static parse_var_id = new RegExp('\\d+', 'gm')
  private static parse_operation = new RegExp('[+*\-]', 'gm')

  private getOperand(el: string, item: string): Operand {
    let value = parseInt(item.match(ShlyapaMarkupUtil.parse_var_id)[0])
    let sign = 1
    let type = item[0] == "$" ? OperandType.VARIABLE : OperandType.CONST;
    if (el[0] == '-')
      sign = -1;
    return {
      value,
      sign,
      type
    }
  }

  public parse(markup: string): ShlyapaMarkup[] {
    const regex = new RegExp(ShlyapaMarkupUtil.parse_pattern, "gm")
    return markup.match(regex).map(el => {
      let res:ShlyapaMarkup = {item: null, sum: null, composition: null};
      //Cut ( ) if exists
      if (el[0] == '(') {
        el = el.substring(1, el.length - 1);
      }
      const item = el.match(ShlyapaMarkupUtil.parse_item);
      const sign = el.match(ShlyapaMarkupUtil.parse_operation);
      //if we get operand without scope just get id and sign and add them to res
      if (item.length == 1) {
        res.item = this.getOperand(el, item[0]);
        return res;
      }
      //If we get operand with scope we get as main first of scoped operands
      else {
        //If we have sign before both operands
        if (sign.length > 1)
          res.item = this.getOperand(sign[0] + item[0], item[0])
        else
          res.item = this.getOperand(item[0], item[0])
        //If we have two operands after we process first, we place main operator on first place
        if (sign.length > 1)
          sign[0] = sign[1]
        if (sign[0] == "-" || sign[0] == '+') {
          res.sum = this.getOperand(sign[0] + item[1], item[1]);
        } else {
          res.composition = this.getOperand(item[1], item[1]);
        }
        return res;
      }
    });
  }
}
