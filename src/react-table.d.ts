import '@tanstack/react-table';
import { FullChannelMetadata } from './app.types';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RecordRow, TValue> {
    channelInfo?: FullChannelMetadata;
  }
}
