import { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from 'react-query';
import { FullChannelMetadata } from '../app.types';
import { getFullChannelMetadata, randomNumber } from '../recordGeneration';

const sleep = (ms: number): Promise<unknown> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const channels = getFullChannelMetadata();

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
