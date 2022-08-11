import { AccessTime, Numbers, Place, Science } from '@mui/icons-material';

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

export interface ScalarMetadata {
  dataType: 'scalar';
  units: string;
}

export interface ImageMetadata {
  dataType: 'image';
  horizontalPixels: number;
  verticalPixels: number;
  cameraGain: number;
  exposureTime: number;
}

export interface WaveformMetadata {
  dataType: 'waveform';
  xUnits: number[];
  yUnits: number[];
}

export interface RecordMetadata {
  dataVersion: string;
  timestamp: string;
  activeArea: string;
  shotNum?: number;
  activeExperiment?: string;
}

export type DataType = 'scalar' | 'image' | 'waveform';

export interface FullCommonChannelMetadata {
  systemName: string;
  dataType: DataType;
  userFriendlyName?: string;
  description?: string;
  units?: string;
}

export interface FullScalarChannelMetadata extends FullCommonChannelMetadata {
  dataType: 'scalar';
  significantFigures?: number;
  scientificNotation?: boolean;
}

export interface FullImageChannelMetadata extends FullCommonChannelMetadata {
  dataType: 'image';
}

export interface FullWaveformChannelMetadata extends FullCommonChannelMetadata {
  dataType: 'waveform';
}

export type FullChannelMetadata =
  | FullScalarChannelMetadata
  | FullImageChannelMetadata
  | FullWaveformChannelMetadata;

export type ChannelMetadata = ScalarMetadata | ImageMetadata | WaveformMetadata;

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
  resultsPerPage: number;
}

export interface RecordRow {
  timestamp: string;
  activeArea: string;
  shotNum?: number;
  activeExperiment?: string;

  [channel: string]: any;
}

export interface DateRange {
  fromDate?: string;
  toDate?: string;
}

export interface ColumnState {
  wordWrap?: boolean;
}

export type PlotType = 'scatter' | 'line';
export interface AxisSettings {
  scale: 'linear' | 'logarithmic' | 'time';
  min?: number;
  max?: number;
}

// Update this whenever we have a new icon for a specific column
export const columnIconMappings = new Map()
  .set('TIMESTAMP', <AccessTime />)
  .set('SHOTNUM', <Numbers />)
  .set('ACTIVEAREA', <Place />)
  .set('ACTIVEEXPERIMENT', <Science />);
