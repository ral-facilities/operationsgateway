import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { type UserPost, type UsersDict } from '../app.types';
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

const addUser = async (user: UserPost): Promise<string> => {
  return ogApi.post<string>(`/users`, user).then((response) => response.data);
};

export const useAddUser = (): UseMutationResult<
  string,
  AxiosError,
  UserPost
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: UserPost) => addUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Users'] });
    },
  });
};
