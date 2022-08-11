import React from 'react';
import axios, { AxiosError } from 'axios';
import { Channel, FullChannelMetadata, Record } from '../app.types';
import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import { Column } from 'react-table';
import { roundNumber } from '../table/cellRenderers/cellContentRenderers';
import { selectUrls } from '../state/slices/configSlice';
import { useAppSelector } from '../state/hooks';

export const generateChannelMetadata = (
  records: Record[]
): FullChannelMetadata[] => {
  let metadata: FullChannelMetadata[] = [];

  records.forEach((record: Record) => {
    const keys = Object.keys(record.channels);
    keys.forEach((key: string) => {
      if (!metadata.find((channel) => channel.systemName === key)) {
        const channel: Channel = record.channels[key];
        const channelDataType = channel.metadata.channel_dtype;
        const newMetadata: FullChannelMetadata = {
          systemName: key,
          channel_dtype: channelDataType,
        };
        metadata.push(newMetadata);
      }
    });
  });

  return metadata;
};

// TODO change this when we have a proper channel info endpoint to query
// This just fetches metadata from the records endpoint at the moment
const fetchChannels = (apiUrl: string): Promise<FullChannelMetadata[]> => {
  return axios.get(`${apiUrl}/records`).then((response) => {
    const records: Record[] = response.data;
    const metadata = generateChannelMetadata(records);
    return metadata;
  });
};

export const useChannels = <T = FullChannelMetadata[],>(
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

export const constructColumns = (channels: FullChannelMetadata[]): Column[] => {
  let myColumns: Column[] = [
    {
      accessor: 'timestamp',
      Header: 'Timestamp',
    },
    {
      accessor: 'shotnum',
      Header: 'Shot Number',
    },
    {
      accessor: 'activeArea',
      Header: 'Active Area',
    },
    {
      accessor: 'activeExperiment',
      Header: 'Active Experiment',
    },
  ];

  channels.forEach((channel: FullChannelMetadata) => {
    const newColumn: Column = {
      Header: () => {
        const headerName = channel.userFriendlyName
          ? channel.userFriendlyName
          : channel.systemName;
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
    if (channel.channel_dtype === 'scalar') {
      newColumn.Cell = ({ value }) =>
        typeof value === 'number' &&
        typeof channel.significantFigures === 'number' ? (
          <React.Fragment>
            {roundNumber(
              value,
              channel.significantFigures,
              channel.scientificNotation ?? false
            )}
          </React.Fragment>
        ) : (
          <React.Fragment>{String(value ?? '')}</React.Fragment>
        );
    }
    myColumns.push(newColumn);
  });
  return myColumns;
};

const useAvailableColumnsOptions = {
  select: (data: FullChannelMetadata[]) => constructColumns(data),
};

export const useAvailableColumns = (): UseQueryResult<Column[], AxiosError> => {
  return useChannels(useAvailableColumnsOptions);
};
