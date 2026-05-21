import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { AxiosError } from 'axios';
import React from 'react';
import {
  FullChannelMetadata,
  FullScalarChannelMetadata,
  isChannelMetadataFloatImage,
  isChannelMetadataImage,
  isChannelMetadataScalar,
  isChannelMetadataString,
  isChannelMetadataVector,
  isChannelMetadataWaveform,
  RecordRow,
  timeChannelName,
  ValidateFunctionState,
  type ChannelMetadata,
} from '../app.types';
import retryOG_APIErrors from '../retryOG_APIErrors';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { selectAppliedFunctions } from '../state/slices/functionsSlice';
import {
  openImageWindow,
  openTraceWindow,
  openVectorWindow,
} from '../state/slices/windowSlice';
import { AppDispatch } from '../state/store';
import {
  Base64ImageThumbnail,
  roundNumber,
} from '../table/cellRenderers/cellContentRenderers';
import { ogApi } from './api';
import { convertExpressionsToStrings } from './functions';

interface ChannelsEndpoint {
  channels: {
    [systemName: string]: Omit<FullChannelMetadata, 'systemName'>;
  };
}

// This metadata is always present in every record
export const staticChannels: Record<
  typeof timeChannelName | 'shotnum' | 'active_area' | 'active_experiment',
  FullChannelMetadata
> = {
  [timeChannelName]: {
    systemName: timeChannelName,
    name: 'Time',
    type: 'scalar',
    path: '/system',
  },
  shotnum: {
    systemName: 'shotnum',
    name: 'Shot Number',
    type: 'scalar', // can be string for Gemini
    path: '/system',
  },
  active_area: {
    systemName: 'active_area',
    name: 'Active Area',
    type: 'string',
    path: '/system',
  },
  active_experiment: {
    systemName: 'active_experiment',
    name: 'Active Experiment',
    type: 'string',
    path: '/system',
  },
};

const fetchChannels = async (): Promise<FullChannelMetadata[]> => {
  const response = await ogApi.get<ChannelsEndpoint>(`/channels`);
  const { channels } = response.data;
  if (!channels || Object.keys(channels).length === 0) return [];
  const convertedChannels: FullChannelMetadata[] = Object.entries(channels).map(
    ([systemName, channel]) => ({
      systemName,
      ...channel,
    })
  );
  return [...Object.values(staticChannels), ...convertedChannels];
};

export interface ChannelSummary {
  first_date: string;
  most_recent_date: string;
  recent_sample: { [timestamp: string]: string | number }[];
}

const fetchChannelSummary = (channel: string): Promise<ChannelSummary> => {
  return ogApi
    .get(`/channels/summary/${channel}`)
    .then((response) => response.data);
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const useChannels = <T extends unknown = FullChannelMetadata[]>(
  options?: Omit<
    UseQueryOptions<FullChannelMetadata[], AxiosError, T, string[]>,
    'queryKey'
  >
): UseQueryResult<T, AxiosError> => {
  return useQuery({
    queryKey: ['channels'],
    queryFn: () => {
      return fetchChannels();
    },

    ...(options ?? {}),
  });
};

export const useChannelSummary = (
  channel: string | undefined
): UseQueryResult<ChannelSummary, AxiosError> => {
  const dataChannel =
    typeof channel !== 'undefined' && !(channel in staticChannels)
      ? channel
      : '';

  return useQuery({
    queryKey: ['channelSummary', dataChannel],

    queryFn: () => {
      return fetchChannelSummary(dataChannel);
    },
    // 400 error means no data for that channel, so no summary can be generated
    // so bail out of retries and don't broadcast error message
    retry: (failureCount, error) => {
      if (error.response?.status === 400) return false;
      return retryOG_APIErrors(failureCount, error as AxiosError);
    },
    meta: {
      silentError: (error: AxiosError) => error.response?.status === 400,
    },
    enabled: dataChannel.length !== 0,
  });
};

export const constructColumnDefs = (
  channels: FullChannelMetadata[],
  dispatch: AppDispatch
): ColumnDef<RecordRow>[] => {
  const columnHelper = createColumnHelper<RecordRow>();
  const myColumnDefs: ColumnDef<RecordRow>[] = [];

  channels.forEach((channel: FullChannelMetadata) => {
    const newColumnDef = columnHelper.accessor(channel.systemName, {
      id: channel.systemName,
      header: () => {
        const headerName = channel.name ? channel.name : channel.systemName;
        // Provide an actual header here when we have it
        // TODO: do we need to split on things other than underscore?
        const parts = headerName.split('_');
        const wordWrap = parts.map(
          (part, i) =>
            // \u200B renders a zero-width space character
            // which allows line-break but isn't visible
            part + (i < parts.length - 1 ? '_\u200B' : '')
        );
        return <React.Fragment>{wordWrap.join('')}</React.Fragment>;
      },
      meta: { channelInfo: channel },
      cell: ({ row, getValue }) => {
        switch (true) {
          case isChannelMetadataScalar(channel): {
            const value = getValue<number | undefined>();
            return (
              <React.Fragment>
                {value && typeof channel.precision === 'number'
                  ? roundNumber(value, channel.precision, channel.notation)
                  : value}
              </React.Fragment>
            );
          }
          case isChannelMetadataString(channel): {
            return (
              <React.Fragment>{getValue<string | undefined>()}</React.Fragment>
            );
          }
          case isChannelMetadataWaveform(channel): {
            const metadata: ChannelMetadata | undefined = (
              row.original as RecordRow
            )['channelMetadata'][channel.systemName];

            return (
              <Base64ImageThumbnail
                base64Data={getValue<string | undefined>()}
                alt={`${channel.name ?? channel.systemName} ${channel.type} for timestamp ${row.getValue(timeChannelName)}`}
                onClick={() => {
                  dispatch(
                    openTraceWindow({
                      recordId: (row.original as RecordRow)['_id'],
                      channelName: channel.systemName,
                      xUnits:
                        metadata?.channel_dtype === 'waveform'
                          ? metadata?.x_units
                          : undefined,
                      yUnits:
                        metadata?.channel_dtype === 'waveform'
                          ? metadata?.y_units
                          : undefined,
                    })
                  );
                }}
              />
            );
          }
          case isChannelMetadataImage(channel) ||
            isChannelMetadataFloatImage(channel): {
            const metadata: ChannelMetadata | undefined = (
              row.original as RecordRow
            )['channelMetadata'][channel.systemName];
            const bitDepth =
              metadata?.channel_dtype === 'image'
                ? metadata.bit_depth
                : undefined;
            return (
              <Base64ImageThumbnail
                base64Data={getValue<string | undefined>()}
                alt={`${channel.name ?? channel.systemName} ${channel.type} for timestamp ${row.getValue(timeChannelName)}`}
                onClick={() => {
                  dispatch(
                    openImageWindow({
                      recordId: (row.original as RecordRow)['_id'],
                      bitDepth: bitDepth,
                      channelName: channel.systemName,
                      isFloat: metadata?.channel_dtype === 'float_image',
                    })
                  );
                }}
              />
            );
          }
          case isChannelMetadataVector(channel): {
            const metadata: ChannelMetadata | undefined = (
              row.original as RecordRow
            )['channelMetadata'][channel.systemName];
            const isVector = metadata?.channel_dtype === 'vector';
            const labels = isVector ? metadata.labels : undefined;
            const units = isVector ? metadata.units : undefined;
            return (
              <Base64ImageThumbnail
                base64Data={getValue<string | undefined>()}
                alt={`${channel.name ?? channel.systemName} ${channel.type} for timestamp ${row.getValue(timeChannelName)}`}
                onClick={() => {
                  dispatch(
                    openVectorWindow({
                      recordId: (row.original as RecordRow)['_id'],
                      channelName: channel.systemName,
                      labels,
                      units,
                    })
                  );
                }}
              />
            );
          }
          default:
            return undefined;
        }
      },
    });

    myColumnDefs.push(newColumnDef);
  });
  return myColumnDefs;
};

export const getScalarChannels = (
  channels: FullChannelMetadata[]
): FullScalarChannelMetadata[] => {
  return channels.filter(
    (channel) => channel.type === 'scalar'
  ) as FullScalarChannelMetadata[];
};

// Utility function to format applied functions
const formatAppliedFunctions = (
  appliedFunctions: ValidateFunctionState[]
): FullChannelMetadata[] => {
  return appliedFunctions.map((func) => ({
    systemName: func.name,
    name: func.name,
    type: func.dataType,
    description: `Function: ${convertExpressionsToStrings([func]).functions[0].expression}`,
    path: '',
  }));
};

export const useScalarChannels = (): UseQueryResult<
  FullScalarChannelMetadata[],
  AxiosError
> => {
  const appliedFunctions = useAppSelector(selectAppliedFunctions);
  const formattedFunctions = formatAppliedFunctions(appliedFunctions);

  const selectFn = React.useCallback(
    (data: FullChannelMetadata[]) =>
      getScalarChannels([...data, ...formattedFunctions]),
    [formattedFunctions]
  );
  return useChannels({ select: selectFn });
};

export const useAvailableColumns = (): UseQueryResult<
  ColumnDef<RecordRow>[],
  AxiosError
> => {
  const appliedFunctions = useAppSelector(selectAppliedFunctions);
  const formattedFunctions = formatAppliedFunctions(appliedFunctions);

  const dispatch = useAppDispatch();
  const selectFn = React.useCallback(
    (data: FullChannelMetadata[]) =>
      constructColumnDefs([...data, ...formattedFunctions], dispatch),
    [dispatch, formattedFunctions]
  );

  return useChannels({ select: selectFn });
};
