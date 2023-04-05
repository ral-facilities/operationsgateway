import { AccessTime, Numbers, Place, Science } from '@mui/icons-material';
import type { CartesianScaleTypeRegistry } from 'chart.js';

export const MicroFrontendId = 'scigateway';
export const MicroFrontendToken = `${MicroFrontendId}:token`;
export const timeChannelName = 'timestamp';

export interface Record {
  _id: string;
  metadata: RecordMetadata;
  channels: { [channel: string]: Channel };
}

export interface RecordRow {
  timestamp: string;
  activeArea?: string;
  shotnum?: number;
  activeExperiment?: string;

  [channel: string]: unknown;
}

export interface ScalarMetadata {
  channel_dtype: 'scalar';
  units?: string;
}

export interface ImageMetadata {
  channel_dtype: 'image';
  x_pixel_size: number;
  x_pixel_units: string;
  y_pixel_size: number;
  y_pixel_units: string;
  gain: number;
  exposure_time_s: number;
}

export interface WaveformMetadata {
  channel_dtype: 'waveform';
  x_units: string;
  y_units: string;
}

export interface RecordMetadata {
  epac_ops_data_version: string;
  timestamp: string;
  activeArea?: string;
  shotnum?: number;
  activeExperiment?: string;
}

export type DataType = 'scalar' | 'image' | 'waveform';

export interface FullCommonChannelMetadata {
  systemName: string;
  type: DataType;
  path: string;
  name?: string;
  description?: string;
  historical?: boolean;
}

export interface FullScalarChannelMetadata extends FullCommonChannelMetadata {
  type: 'scalar';
  precision?: number;
  notation?: 'scientific' | 'normal';
  units?: string;
}

export interface FullImageChannelMetadata extends FullCommonChannelMetadata {
  type: 'image';
}

export interface FullWaveformChannelMetadata extends FullCommonChannelMetadata {
  type: 'waveform';
  x_units?: string;
  y_units?: string;
}

export type FullChannelMetadata =
  | FullScalarChannelMetadata
  | FullImageChannelMetadata
  | FullWaveformChannelMetadata;

// Type guards because TS can't deal with nested discriminated unions
export const isChannelMetadataScalar = (
  c: FullChannelMetadata
): c is FullScalarChannelMetadata => c.type === 'scalar';
export const isChannelMetadataImage = (
  c: FullChannelMetadata
): c is FullImageChannelMetadata => c.type === 'image';
export const isChannelMetadataWaveform = (
  c: FullChannelMetadata
): c is FullWaveformChannelMetadata => c.type === 'waveform';

export type ChannelMetadata = ScalarMetadata | ImageMetadata | WaveformMetadata;

export interface ScalarChannel {
  metadata: ScalarMetadata;
  data: number | string;
}

export interface ImageChannel {
  metadata: ImageMetadata;
  image_path: string;
  thumbnail: string;
}

export interface WaveformChannel {
  metadata: WaveformMetadata;
  waveform_id: string;
  thumbnail: string;
}

export type Channel = ScalarChannel | ImageChannel | WaveformChannel;

// Type guards because TS can't deal with nested discriminated unions
export const isChannelScalar = (c: Channel): c is ScalarChannel =>
  c?.metadata?.channel_dtype === 'scalar';
export const isChannelImage = (c: Channel): c is ImageChannel =>
  c?.metadata?.channel_dtype === 'image';
export const isChannelWaveform = (c: Channel): c is WaveformChannel =>
  c?.metadata?.channel_dtype === 'waveform';

export type Order = 'asc' | 'desc';

export interface SortType {
  [column: string]: Order;
}

export interface DateRange {
  fromDate?: string;
  toDate?: string;
}

export interface ShotnumRange {
  min?: number;
  max?: number;
}

export interface ExperimentParams {
  _id: string;
  end_date: string;
  experiment_id: string;
  part: number;
  start_date: string;
}

export interface SearchParams {
  dateRange: DateRange;
  shotnumRange: ShotnumRange;
  maxShots: number;
  experimentID: ExperimentParams | null;
}

export interface ColumnState {
  wordWrap?: boolean;
}

export type PlotType = 'scatter' | 'line';

export type XAxisScale = Extract<
  keyof CartesianScaleTypeRegistry,
  'linear' | 'logarithmic' | 'time'
>;

export type YAxisScale = Extract<
  keyof CartesianScaleTypeRegistry,
  'linear' | 'logarithmic'
>;

export type PlotDataset = {
  name: string;
  data: {
    [x: string]: number;
  }[];
};

export type SelectedPlotChannel = {
  name: string;
  displayName?: string;
  options: {
    visible: boolean;
    lineStyle: LineStyle;
    colour: string;
    yAxis: 'left' | 'right';
  };
};

export type LineStyle = 'solid' | 'dashed' | 'dotted';

// Update this whenever we have a new icon for a specific column
export const columnIconMappings = new Map()
  .set(timeChannelName, <AccessTime />)
  .set('shotnum', <Numbers />)
  .set('activeArea', <Place />)
  .set('activeExperiment', <Science />);
