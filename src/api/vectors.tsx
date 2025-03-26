import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Vector } from '../app.types';
import { ogApi } from './api';

export const fetchVector = async (
  recordId: string,
  channelName: string
): Promise<Vector> => {
  const queryParams = new URLSearchParams();

  return ogApi
    .get(`/vectors/${recordId}/${channelName}`, {
      params: queryParams,
    })
    .then((response) => {
      return response.data;
    });
};

export const useVector = (
  recordId: string,
  channelName: string
): UseQueryResult<Vector, AxiosError> => {
  return useQuery({
    queryKey: ['vectors', recordId, channelName],

    queryFn: () => {
      return fetchVector(recordId, channelName);
    },
  });
};
