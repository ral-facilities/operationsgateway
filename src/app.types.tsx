import { Column } from 'react-table';

export const MicroFrontendId = 'scigateway';

export interface DateFilter {
  startDate?: string;
  endDate?: string;
}

export interface TextFilter {
  value?: string | number;
  type: string;
}

export type Filter = string[] | TextFilter | DateFilter;

export interface FiltersType {
  [column: string]: Filter;
}

export type AdditionalFilters = {
  filterType: string;
  filterValue: string;
}[];

export interface Record {
  shotId?: number;
  timestamp: string;
  activeArea: string;
  activeExperiment: string;
}

export const recordColumns: Column[] = [
  {
    Header: 'Shot ID',
    accessor: 'shotId', // accessor is the "key" in the data
  },
  {
    Header: 'Time',
    accessor: 'timestamp',
  },
  {
    Header: 'Active Area',
    accessor: 'activeArea',
  },
  {
    Header: 'Active Experiment',
    accessor: 'activeExperiment',
  },
];

export type Order = 'asc' | 'desc';

export interface SortType {
  [column: string]: Order;
}

// TODO remove optionals and make mandatory when implemented
export interface QueryParams {
  sort: SortType;
  filters?: FiltersType;
  page: number;
  startDate?: Date;
  endDate?: Date;
}
