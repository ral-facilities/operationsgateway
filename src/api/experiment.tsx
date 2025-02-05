import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ExperimentParams } from '../app.types';
import { ogApi } from './api';

const fetchExperiment = async (): Promise<ExperimentParams[]> => {
  return ogApi.get(`/experiments`).then((response) => response.data);
};

export const useExperiment = (): UseQueryResult<
  ExperimentParams[],
  AxiosError
> => {
  return useQuery({
    queryKey: ['experiments'],
    queryFn: () => fetchExperiment(),
  });
};
