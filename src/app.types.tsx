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

export interface RecordRow {
  timestamp: string;
  activeArea: string;
  shotnum?: number;
  activeExperiment?: string;

  [channel: string]: any;
}

export interface ScalarMetadata {
  channel_dtype: 'scalar';
  units?: string;
}

export interface ImageMetadata {
  channel_dtype: 'image';
  horizontalPixels: number;
  horizontalPixelUnits: string;
  verticalPixels: number;
  verticalPixelUnits: string;
  cameraGain: number;
  exposureTime: number;
}

export interface WaveformMetadata {
  channel_dtype: 'waveform';
  xUnits: string;
  yUnits: string;
}

export interface RecordMetadata {
  dataVersion: string;
  timestamp: string;
  activeArea: string;
  shotnum?: number;
  activeExperiment?: string;
}

export type DataType = 'scalar' | 'image' | 'waveform';

export interface FullCommonChannelMetadata {
  systemName: string;
  channel_dtype: DataType;
  userFriendlyName?: string;
  description?: string;
  units?: string;
}

export interface FullScalarChannelMetadata extends FullCommonChannelMetadata {
  channel_dtype: 'scalar';
  significantFigures?: number;
  scientificNotation?: boolean;
}

export interface FullImageChannelMetadata extends FullCommonChannelMetadata {
  channel_dtype: 'image';
}

export interface FullWaveformChannelMetadata extends FullCommonChannelMetadata {
  channel_dtype: 'waveform';
}

export type FullChannelMetadata =
  | FullScalarChannelMetadata
  | FullImageChannelMetadata
  | FullWaveformChannelMetadata;

export type ChannelMetadata = ScalarMetadata | ImageMetadata | WaveformMetadata;

export interface Channel {
  metadata: ChannelMetadata;
}

export interface ScalarChannel extends Channel {
  data: number | string;
}

export interface ImageChannel extends Channel {
  imagePath: string;
  thumbnail: string;
}

export interface WaveformChannel extends Channel {
  waveformId: string;
  thumbnail: string;
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

export interface DateRange {
  fromDate?: string;
  toDate?: string;
}

export interface ColumnState {
  wordWrap?: boolean;
}

// Update this whenever we have a new icon for a specific column
export const columnIconMappings = new Map()
  .set('TIMESTAMP', <AccessTime />)
  .set('SHOTNUM', <Numbers />)
  .set('ACTIVEAREA', <Place />)
  .set('ACTIVEEXPERIMENT', <Science />);
