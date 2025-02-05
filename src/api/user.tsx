import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { type UsersDict } from '../app.types';
import { ogApi } from './api';

const getUsers = async (): Promise<UsersDict> => {
  return ogApi.get(`/users`).then((response) => {
    return response.data;
  });
};

export const useUsers = (): UseQueryResult<UsersDict, AxiosError> => {
  return useQuery({
    queryKey: ['Users'],
    queryFn: () => {
      return getUsers();
    },
  });
};
