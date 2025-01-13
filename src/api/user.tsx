import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { User, type UserPost } from '../app.types';
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

const addUser = (apiUrl: string, user: UserPost): Promise<string> => {
  return axios
    .post<string>(`${apiUrl}/users`, user, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => response.data);
};

export const useAddUser = (): UseMutationResult<
  string,
  AxiosError,
  UserPost
> => {
  const { apiUrl } = useAppSelector(selectUrls);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: UserPost) => addUser(apiUrl, user),
    onError: (error) => {
      console.log('Got error ' + error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Users'] });
    },
  });
};
