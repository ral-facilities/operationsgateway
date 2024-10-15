import '@tanstack/react-table';
import { FullChannelMetadata } from './app.types';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RecordRow, TValue> {
    channelInfo?: FullChannelMetadata;
  }
}
