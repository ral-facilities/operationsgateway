import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { User, UserPatch } from '../app.types';
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

const addUser = (apiUrl: string, user: User): Promise<string> => {
  return axios
    .post<string>(`${apiUrl}/users`, user, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => response.data);
};

export const useAddUser = (): UseMutationResult<string, AxiosError, User> => {
  const { apiUrl } = useAppSelector(selectUrls);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: User) => addUser(apiUrl, user),
    onError: (error) => {
      console.log('Got error ' + error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Users'] });
    },
  });
};

const editUser = (apiUrl: string, user: UserPatch): Promise<string> => {
  return axios
    .patch<string>(`${apiUrl}/users`, user, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => response.data);
};

export const useEditUser = (): UseMutationResult<
  string,
  AxiosError,
  UserPatch
> => {
  const { apiUrl } = useAppSelector(selectUrls);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: UserPatch) => editUser(apiUrl, user),
    onError: (error) => {
      console.log('Got error ' + error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Users'] });
    },
  });
};

const deleteUser = (apiUrl: string, userId: string): Promise<void> => {
  return axios
    .delete(`${apiUrl}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => response.data);
};

export const useDeleteUser = (): UseMutationResult<
  void,
  AxiosError,
  string
> => {
  const { apiUrl } = useAppSelector(selectUrls);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteUser(apiUrl, userId),
    onError: (error) => {
      console.log('Got error ' + error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Users'] });
    },
  });
};
