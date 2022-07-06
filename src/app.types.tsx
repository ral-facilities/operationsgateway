export const MicroFrontendId = 'scigateway';

export interface TextFilter {
  value?: string | number;
  type: string;
}

export type Filter = string[] | TextFilter;

export interface FiltersType {
  [column: string]: Filter;
}

export type AdditionalFilters = {
  filterType: string;
  filterValue: string;
}[];

export interface Record {
  id: string;
  metadata: RecordMetadata;
  channels: { [channel: string]: Channel };
}

export interface Scalar {
  units: string;
}

export interface Image {
  horizontalPixels: number;
  verticalPixels: number;
  cameraGain: number;
  exposureTime: number;
}

export interface Waveform {
  xUnits: number[];
  yUnits: number[];
}

export interface RecordMetadata {
  dataVersion: string;
  shotNum: number;
  timestamp: string;
  activeArea?: string;
  activeExperiment?: string;
}

export interface ChannelMetadata {
  dataType: Scalar | Image | Waveform;
}

export interface Channel {
  metadata: ChannelMetadata;
  data: any;
}

export type Order = 'asc' | 'desc';

export interface SortType {
  [column: string]: Order;
}

// TODO remove optionals and make mandatory when implemented
export interface QueryParams {
  sort: SortType;
  filters?: FiltersType;
  page: number;
  dateRange: DateRange;
}

export interface RecordRow {
  id: string;
  shotNum: number;
  timestamp: string;

  [channel: string]: any;
}

export interface DateRange {
  fromDate?: string;
  toDate?: string;
}
