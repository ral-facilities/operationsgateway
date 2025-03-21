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
  isChannelMetadataImage,
  isChannelMetadataScalar,
  isChannelMetadataWaveform,
  RecordRow,
  timeChannelName,
  ValidateFunctionState,
  type ChannelMetadata,
} from '../app.types';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { selectAppliedFunctions } from '../state/slices/functionsSlice';
import { openImageWindow, openTraceWindow } from '../state/slices/windowSlice';
import { AppDispatch } from '../state/store';
import {
  roundNumber,
  TraceOrImageThumbnail,
} from '../table/cellRenderers/cellContentRenderers';
import { ogApi } from './api';
import { convertExpressionsToStrings } from './functions';

interface ChannelsEndpoint {
  channels: {
    [systemName: string]: Omit<FullChannelMetadata, 'systemName'>;
  };
}

// This metadata is always present in every record
export const staticChannels: { [systemName: string]: FullChannelMetadata } = {
  [timeChannelName]: {
    systemName: timeChannelName,
    name: 'Time',
    type: 'scalar',
    path: '/system',
  },
  shotnum: {
    systemName: 'shotnum',
    name: 'Shot Number',
    type: 'scalar',
    path: '/system',
  },
  activeArea: {
    systemName: 'activeArea',
    name: 'Active Area',
    type: 'scalar',
    path: '/system',
  },
  activeExperiment: {
    systemName: 'activeExperiment',
    name: 'Active Experiment',
    type: 'scalar',
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

const fetchChannelSummary = async (
  channel: string
): Promise<ChannelSummary> => {
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
      cell: isChannelMetadataScalar(channel)
        ? ({ getValue }) => {
            const value = getValue();
            return typeof value === 'number' &&
              typeof channel.precision === 'number' ? (
              <React.Fragment>
                {roundNumber(value, channel.precision, channel.notation)}
              </React.Fragment>
            ) : (
              <React.Fragment>{String(value ?? '')}</React.Fragment>
            );
          }
        : isChannelMetadataWaveform(channel)
          ? ({ row, getValue }) => {
              const value = getValue<string>();
              return (
                <TraceOrImageThumbnail
                  base64Data={value}
                  alt={`${channel.name ?? channel.systemName} ${
                    channel.type
                  } for timestamp ${row.getValue(timeChannelName)}`}
                  onClick={() => {
                    dispatch(
                      openTraceWindow({
                        recordId: (row.original as RecordRow)['_id'],
                        channelName: channel.systemName,
                      })
                    );
                  }}
                />
              );
            }
          : isChannelMetadataImage(channel)
            ? ({ row, getValue }) => {
                const value = getValue<string>();

                const metadata: ChannelMetadata | undefined = (
                  row.original as RecordRow
                )['channelMetadata'][channel.systemName];
                const bitDepth =
                  metadata && metadata.channel_dtype === 'image'
                    ? metadata.bit_depth
                    : undefined;

                return (
                  <TraceOrImageThumbnail
                    base64Data={value}
                    alt={`${channel.name ?? channel.systemName} ${
                      channel.type
                    } for timestamp ${row.getValue(timeChannelName)}`}
                    onClick={() => {
                      dispatch(
                        openImageWindow({
                          recordId: (row.original as RecordRow)['_id'],
                          bitDepth: bitDepth,
                          channelName: channel.systemName,
                        })
                      );
                    }}
                  />
                );
              }
            : undefined,
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
