import { AccessTime, Numbers, Place, Science } from '@mui/icons-material';
import type { CartesianScaleTypeRegistry } from 'chart.js';

export const MicroFrontendId = 'scigateway';

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

  [channel: string]: unknown;
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

export interface ScalarChannel {
  metadata: ScalarMetadata;
  data: number | string;
}

export interface ImageChannel {
  metadata: ImageMetadata;
  imagePath: string;
  thumbnail: string;
}

export interface WaveformChannel {
  metadata: WaveformMetadata;
  waveformId: string;
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

export interface SearchParams {
  dateRange: DateRange;
  shotnumRange: ShotnumRange;
}

export interface ColumnState {
  wordWrap?: boolean;
}

export type PlotType = 'scatter' | 'line';

export type XAxisScale = Extract<
  keyof CartesianScaleTypeRegistry,
  'linear' | 'logarithmic' | 'time'
>;

export type YAxesScale = Extract<
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
  .set('TIMESTAMP', <AccessTime />)
  .set('SHOTNUM', <Numbers />)
  .set('ACTIVEAREA', <Place />)
  .set('ACTIVEEXPERIMENT', <Science />);
