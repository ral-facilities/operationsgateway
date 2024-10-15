import { AccessTime, Numbers, Place, Science } from '@mui/icons-material';
import type { CartesianScaleTypeRegistry } from 'chart.js';
import { ImportSessionType } from './state/store';

export const MicroFrontendId = 'scigateway';
export const MicroFrontendToken = `${MicroFrontendId}:token`;
export const timeChannelName = 'timestamp';

export interface Record {
  _id: string;
  metadata: RecordMetadata;
  // channels can be undefined when the user only has metadata channels selected
  // as with projection the channels object isn't returned
  // whereas we always query for timestamp and so metadata is always defined
  channels?: { [channel: string]: Channel | undefined };
}

export interface RecordRow {
  _id: string;
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
export const isChannelScalar = (c: Channel | undefined): c is ScalarChannel =>
  c?.metadata?.channel_dtype === 'scalar';
export const isChannelImage = (c: Channel | undefined): c is ImageChannel =>
  c?.metadata?.channel_dtype === 'image';
export const isChannelWaveform = (
  c: Channel | undefined
): c is WaveformChannel => c?.metadata?.channel_dtype === 'waveform';

export interface Waveform {
  _id: string;
  x: number[];
  y: number[];
}

export type Order = 'asc' | 'desc';

export interface SortType {
  [column: string]: Order;
}

export interface DateRange {
  fromDate?: string;
  toDate?: string;
}

export interface DateRangetoShotnumConverter {
  from?: string;
  to?: string;
  min?: number;
  max?: number;
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

export const DEFAULT_WINDOW_VARS = {
  innerWidth: 600,
  innerHeight: 400,
  screenX: 200,
  screenY: 200,
};

export interface WindowConfig {
  id: string;
  open: boolean;
  title: string;
  innerWidth: number;
  innerHeight: number;
  screenX: number;
  screenY: number;
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
  units: string;
  displayName?: string;
  options: {
    visible: boolean;
    lineStyle: LineStyle;
    lineWidth?: number;
    markerStyle?: MarkerStyle;
    markerSize?: number;
    colour: string;
    markerColour?: string | undefined;
    yAxis: 'left' | 'right';
  };
};

export type LineStyle = 'solid' | 'dashed' | 'dotted';
export type MarkerStyle =
  | 'circle'
  | 'cross'
  | 'crossRot'
  | 'dash'
  | 'line'
  | 'rect'
  | 'rectRounded'
  | 'rectRot'
  | 'star'
  | 'triangle'
  | false;

// Update this whenever we have a new icon for a specific column
export const columnIconMappings = new Map()
  .set(timeChannelName, <AccessTime />)
  .set('shotnum', <Numbers />)
  .set('activeArea', <Place />)
  .set('activeExperiment', <Science />);

export interface Session {
  name: string;
  summary: string;
  auto_saved: boolean;
  session: ImportSessionType;
}

export interface SessionResponse {
  _id: string;
  name: string;
  summary: string;
  timestamp: string;
  auto_saved: boolean;
  session: ImportSessionType;
}

export interface SessionListItem {
  name: string;
  summary: string;
  auto_saved: boolean;
  timestamp: string;
  _id: string;
}

export interface FunctionToken {
  type: 'channel' | 'functionToken' | 'function' | 'number';
  value: string;
  label: string;
}

export interface FunctionOperator {
  name: string;
  symbol: string;
  details?: string;
}

export interface ValidateFunctionPost {
  name: string;
  expression: string;
}

export interface ValidateFunctionState {
  id: string;
  name: string;
  expression: FunctionToken[];
  dataType: DataType;
  channels: string[];
}

export interface APIFunctionState {
  channels: string[];
  functions: ValidateFunctionPost[];
}
export interface APIErrorResponse {
  type: string;
  loc: (string | number)[];
  msg: string;
  input: string;
}
export interface APIError {
  detail: string | APIErrorResponse[];
}

export interface FavouriteFilterPost {
  name: string;
  filter: string;
}

export type FavouriteFilterPatch = Partial<FavouriteFilterPost>;

export interface FavouriteFilter extends FavouriteFilterPost {
  _id: string;
}
