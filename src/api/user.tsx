import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { UserPatch, UserPost, type UsersDict } from '../app.types';
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

const editUser = async (user: UserPatch): Promise<string> => {
  return ogApi.patch<string>(`/users`, user).then((response) => response.data);
};

export const useEditUser = (): UseMutationResult<
  string,
  AxiosError,
  UserPatch
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: UserPatch) => editUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Users'] });
    },
  });
};

const deleteUser = async (userId: string): Promise<void> => {
  return ogApi.delete(`/users/${userId}`).then((response) => response.data);
};

export const useDeleteUser = (): UseMutationResult<
  void,
  AxiosError,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Users'] });
    },
  });
};
