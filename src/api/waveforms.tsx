import { UseQueryResult, useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { APIFunctionState, Waveform } from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { useAppSelector } from '../state/hooks';
import { selectUrls } from '../state/slices/configSlice';
import { selectQueryParams } from '../state/slices/searchSlice';

export const fetchWaveform = async (
  apiUrl: string,
  recordId: string,
  channelName: string,
  functionsState: APIFunctionState
): Promise<Waveform> => {
  const queryParams = new URLSearchParams();
  functionsState.functions.forEach((func) => {
    queryParams.append('functions', JSON.stringify(func));
  });
  return axios
    .get(`${apiUrl}/waveforms/${recordId}/${channelName}`, {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
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
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery({
    queryKey: ['waveforms', recordId, channelName, functions],

    queryFn: (params) => {
      return fetchWaveform(apiUrl, recordId, channelName, functions);
    },
  });
};
