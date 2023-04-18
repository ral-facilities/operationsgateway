import { UseQueryResult, useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { readSciGatewayToken } from '../parseTokens';
import { useAppSelector } from '../state/hooks';
import { selectUrls } from '../state/slices/configSlice';

export const fetchImage = async (
  apiUrl: string,
  recordId: string,
  channelName: string
): Promise<string> => {
  return axios
    .get(`${apiUrl}/images/${recordId}/${channelName}`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
      responseType: 'blob',
    })
    .then((response) => {
      return URL.createObjectURL(response.data);
    });
};

export const useImage = (
  recordId: string,
  channelName: string
): UseQueryResult<string, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery<string, AxiosError, string, [string, string, string]>(
    ['images', recordId, channelName],
    (params) => {
      return fetchImage(apiUrl, recordId, channelName);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};
