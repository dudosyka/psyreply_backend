import { SearchFilter } from '../../../filters/search.filter';

class Filter {
  id?: number[] | number;
  company_id?: number;
  block_id?: number;
  createdAt?: string;
  user_id?: number;
  group_id?: number;
  week?: number;
}

export class ResultFitlerDto extends SearchFilter<Filter> {}
