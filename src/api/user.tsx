import { UseQueryResult, useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { User } from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { useAppSelector } from '../state/hooks';
import { selectUrls } from '../state/slices/configSlice';

const getUsers = (apiUrl: string): Promise<User[]> => {
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

export const useUsers = (): UseQueryResult<User[], AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery({
    queryKey: ['Users'],
    queryFn: () => {
      return getUsers(apiUrl);
    },
  });
};
