import { SearchFilter } from "../../../filters/search.filter";

class Filter {
  company_id?: number;
  block_id?: number;
  createdAt?: string;
  user_id?: number;
}

export class ResultFitlerDto extends SearchFilter<Filter> {
}
