import axios, { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { ExperimentParams } from '../app.types';
import { useAppSelector } from '../state/hooks';
import { selectUrls } from '../state/slices/configSlice';
import { readSciGatewayToken } from '../parseTokens';

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

  return useQuery(
    ['experiments'],
    (params) => {
      return fetchExperiment(apiUrl);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};
