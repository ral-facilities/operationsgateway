import React from 'react';
import { AxiosError } from 'axios';
import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import { Column } from 'react-table';
import { FullChannelMetadata } from '../app.types';
import { getFullChannelMetadata, randomNumber } from '../recordGeneration';
import { roundNumber } from '../table/cellRenderers/cellContentRenderers';

const sleep = (ms: number): Promise<unknown> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// TODO change this when we have an API to query
const fetchChannels = async (): Promise<FullChannelMetadata[]> => {
  const channels = getFullChannelMetadata();
  await sleep(randomNumber(0, 1000));
  return Promise.resolve(channels);
};

export const useChannels = <T = FullChannelMetadata[],>(
  options?: UseQueryOptions<FullChannelMetadata[], AxiosError, T, string[]>
): UseQueryResult<T, AxiosError> => {
  return useQuery(
    ['channels'],
    (params) => {
      return fetchChannels();
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
      accessor: 'shotNum',
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
    if (channel.dataType === 'scalar') {
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
