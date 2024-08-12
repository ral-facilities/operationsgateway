import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { ExperimentParams } from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { useAppSelector } from '../state/hooks';
import { selectUrls } from '../state/slices/configSlice';

const fetchExperiment = (apiUrl: string): Promise<ExperimentParams[]> => {
  return axios
    .get(`${apiUrl}/experiments`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useExperiment = (): UseQueryResult<
  ExperimentParams[],
  AxiosError
> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery({
    queryKey: ['experiments'],

    queryFn: () => fetchExperiment(apiUrl),
  });
};
