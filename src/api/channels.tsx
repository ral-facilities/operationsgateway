import React from 'react';
import axios, { AxiosError } from 'axios';
import {
  FullChannelMetadata,
  FullScalarChannelMetadata,
  isChannelMetadataImage,
  isChannelMetadataScalar,
  isChannelMetadataWaveform,
  RecordRow,
  timeChannelName,
} from '../app.types';
import {
  useQuery,
  UseQueryResult,
  UseQueryOptions,
} from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import {
  roundNumber,
  TraceOrImageThumbnail,
} from '../table/cellRenderers/cellContentRenderers';
import { selectUrls } from '../state/slices/configSlice';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { readSciGatewayToken } from '../parseTokens';
import { AppDispatch } from '../state/store';
import { openImageWindow, openTraceWindow } from '../state/slices/windowSlice';

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

const fetchChannels = (apiUrl: string): Promise<FullChannelMetadata[]> => {
  return axios
    .get<ChannelsEndpoint>(`${apiUrl}/channels`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      const { channels } = response.data;

      if (!channels || Object.keys(channels).length === 0) return [];

      const convertedChannels: FullChannelMetadata[] = Object.entries(
        channels
      ).map(([systemName, channel]) => ({
        systemName,
        ...channel,
      }));

      return [...Object.values(staticChannels), ...convertedChannels];
    });
};

export interface ChannelSummary {
  first_date: string;
  most_recent_date: string;
  recent_sample: { [timestamp: string]: string | number }[];
}

const fetchChannelSummary = (
  apiUrl: string,
  channel: string
): Promise<ChannelSummary> => {
  return axios
    .get(`${apiUrl}/channels/summary/${channel}`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const useChannels = <T extends unknown = FullChannelMetadata[]>(
  options?: Omit<
    UseQueryOptions<FullChannelMetadata[], AxiosError, T, string[]>,
    'queryKey'
  >
): UseQueryResult<T, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery({
    queryKey: ['channels'],
    queryFn: (params) => {
      return fetchChannels(apiUrl);
    },

    ...(options ?? {}),
  });
};

export const useChannelSummary = (
  channel: string | undefined
): UseQueryResult<ChannelSummary, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);
  const dataChannel =
    typeof channel !== 'undefined' && !(channel in staticChannels)
      ? channel
      : '';

  return useQuery({
    queryKey: ['channelSummary', dataChannel],

    queryFn: (params) => {
      return fetchChannelSummary(apiUrl, dataChannel);
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
                  onClick={() =>
                    dispatch(
                      openTraceWindow({
                        recordId: (row.original as RecordRow)['_id'],
                        channelName: channel.systemName,
                      })
                    )
                  }
                />
              );
            }
          : isChannelMetadataImage(channel)
            ? ({ row, getValue }) => {
                const value = getValue<string>();
                return (
                  <TraceOrImageThumbnail
                    base64Data={value}
                    alt={`${channel.name ?? channel.systemName} ${
                      channel.type
                    } for timestamp ${row.getValue(timeChannelName)}`}
                    onClick={() =>
                      dispatch(
                        openImageWindow({
                          recordId: (row.original as RecordRow)['_id'],
                          channelName: channel.systemName,
                        })
                      )
                    }
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

const useScalarChannelsOptions = {
  select: (data: FullChannelMetadata[]) => getScalarChannels(data),
};

export const useScalarChannels = (): UseQueryResult<
  FullScalarChannelMetadata[],
  AxiosError
> => {
  return useChannels(useScalarChannelsOptions);
};

export const useAvailableColumns = (): UseQueryResult<
  ColumnDef<RecordRow>[],
  AxiosError
> => {
  const dispatch = useAppDispatch();
  const selectFn = React.useCallback(
    (data: FullChannelMetadata[]) => constructColumnDefs(data, dispatch),
    [dispatch]
  );
  return useChannels({ select: selectFn });
};
