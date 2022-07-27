import { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from 'react-query';
import { Channel, FullChannelMetadata, Record } from '../app.types';
import { randomNumber } from '../recordGeneration';
import { fetchRecords } from './records';

const sleep = (ms: number): Promise<unknown> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const generateActualChannelMetadata = async (): Promise<
  FullChannelMetadata[]
> => {
  let metadata: FullChannelMetadata[] = [];

  let records: Record[] = await fetchRecords(0);
  records.forEach((record: Record) => {
    const keys = Object.keys(record.channels);
    keys.forEach((key: string) => {
      const channel: Channel = record.channels[key];
      const channelDataType = channel.metadata.channel_dtype;
      const newMetadata: FullChannelMetadata = {
        systemName: key,
        channel_dtype: channelDataType,
      };
      metadata.push(newMetadata);
    });
  });

  return metadata;
};

const channels = generateActualChannelMetadata();

// TODO change this when we have an API to query
const fetchChannels = async (): Promise<FullChannelMetadata[]> => {
  await sleep(randomNumber(0, 1000));
  return Promise.resolve(channels);
};

export const useChannels = (): UseQueryResult<
  FullChannelMetadata[],
  AxiosError
> => {
  return useQuery<
    FullChannelMetadata[],
    AxiosError,
    FullChannelMetadata[],
    [string]
  >(
    ['channels'],
    (params) => {
      return fetchChannels();
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};
