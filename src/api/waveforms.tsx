import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { APIFunctionState, Waveform } from '../app.types';
import { useAppSelector } from '../state/hooks';
import { selectQueryParams } from '../state/slices/searchSlice';
import { ogApi } from './api';

export const fetchWaveform = async (
  recordId: string,
  channelName: string,
  functionsState: APIFunctionState
): Promise<Waveform> => {
  const queryParams = new URLSearchParams();
  functionsState.functions.forEach((func) => {
    queryParams.append('functions', JSON.stringify(func));
  });
  return ogApi
    .get(`/waveforms/${recordId}/${channelName}`, {
      params: queryParams,
    })
    .then((response) => {
      return response.data;
    });
};

export const useWaveform = (
  recordId: string,
  channelName: string
): UseQueryResult<Waveform, AxiosError> => {
  const { functions } = useAppSelector(selectQueryParams);

  return useQuery({
    queryKey: ['waveforms', recordId, channelName, functions],

    queryFn: () => {
      return fetchWaveform(recordId, channelName, functions);
    },
  });
};
