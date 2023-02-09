import React from 'react';
import axios, { AxiosError } from 'axios';
import {
  FullChannelMetadata,
  FullScalarChannelMetadata,
  isChannelMetadataScalar,
  timeChannelName,
} from '../app.types';
import {
  useQuery,
  UseQueryResult,
  UseQueryOptions,
} from '@tanstack/react-query';
import { Column } from 'react-table';
import {
  renderImage,
  roundNumber,
} from '../table/cellRenderers/cellContentRenderers';
import { selectUrls } from '../state/slices/configSlice';
import { useAppSelector } from '../state/hooks';
import { readSciGatewayToken } from '../parseTokens';

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
  options?: UseQueryOptions<FullChannelMetadata[], AxiosError, T, string[]>
): UseQueryResult<T, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery(
    ['channels'],
    (params) => {
      return fetchChannels(apiUrl);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      ...(options ?? {}),
    }
  );
};

export const useChannelSummary = (
  channel: string | undefined
): UseQueryResult<ChannelSummary, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);
  const dataChannel =
    typeof channel !== 'undefined' && !(channel in staticChannels)
      ? channel
      : '';

  return useQuery(
    ['channelSummary', dataChannel],
    (params) => {
      return fetchChannelSummary(apiUrl, dataChannel);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      enabled: dataChannel.length !== 0,
    }
  );
};

export const constructColumns = (channels: FullChannelMetadata[]): Column[] => {
  const myColumns: Column[] = [];

  channels.forEach((channel: FullChannelMetadata) => {
    const newColumn: Column = {
      Header: () => {
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
      accessor: channel.systemName,
      // TODO: get these from data channel info
      channelInfo: channel,
    };
    if (isChannelMetadataScalar(channel)) {
      newColumn.Cell = ({ value }) =>
        typeof value === 'number' && typeof channel.precision === 'number' ? (
          <React.Fragment>
            {roundNumber(value, channel.precision, channel.notation)}
          </React.Fragment>
        ) : (
          <React.Fragment>{String(value ?? '')}</React.Fragment>
        );
    } else {
      newColumn.Cell = ({ row, value }) =>
        renderImage(
          value,
          `${channel.name ?? channel.systemName} ${
            channel.type
          } for timestamp ${row.values[timeChannelName]}`
        );
    }
    myColumns.push(newColumn);
  });
  return myColumns;
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

const useAvailableColumnsOptions = {
  select: (data: FullChannelMetadata[]) => constructColumns(data),
};

export const useScalarChannels = (): UseQueryResult<
  FullScalarChannelMetadata[],
  AxiosError
> => {
  return useChannels(useScalarChannelsOptions);
};

export const useAvailableColumns = (): UseQueryResult<Column[], AxiosError> => {
  return useChannels(useAvailableColumnsOptions);
};
