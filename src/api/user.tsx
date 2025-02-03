import { UseQueryResult, useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { type UsersDict } from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { useAppSelector } from '../state/hooks';
import { selectUrls } from '../state/slices/configSlice';

const getUsers = async (apiUrl: string): Promise<UsersDict> => {
  return axios
    .get(`${apiUrl}/users`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useUsers = (): UseQueryResult<UsersDict, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery({
    queryKey: ['Users'],
    queryFn: () => {
      return getUsers(apiUrl);
    },
  });
};
