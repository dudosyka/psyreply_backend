import { SearchFilter } from "../../../filters/search.filter";

class Filter {
  except_group_id?: number;
  company_id?: number;
  group_id?: number;
}

export class UserFilterDto extends SearchFilter<Filter> {}
