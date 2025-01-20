import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  FavouriteFilter,
  FavouriteFilterPatch,
  FavouriteFilterPost,
} from '../app.types';
import { ogApi } from './api';

const addFavouriteFilter = async (
  favouriteFilter: FavouriteFilterPost
): Promise<string> => {
  const queryParams = new URLSearchParams();

  queryParams.append('name', favouriteFilter.name);
  queryParams.append('filter', favouriteFilter.filter);

  return ogApi
    .post<string>(
      `/users/filters`,
      {},
      {
        params: queryParams,
      }
    )
    .then((response) => response.data);
};

export const useAddFavouriteFilter = (): UseMutationResult<
  string,
  AxiosError,
  FavouriteFilterPost
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (favouriteFilter: FavouriteFilterPost) =>
      addFavouriteFilter(favouriteFilter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favouriteFilters'] });
    },
  });
};

const editFavouriteFilter = async (
  id: string,
  favouriteFilter: FavouriteFilterPatch
): Promise<string> => {
  const queryParams = new URLSearchParams();

  if (favouriteFilter.name) queryParams.append('name', favouriteFilter.name);
  if (favouriteFilter.filter)
    queryParams.append('filter', favouriteFilter.filter);

  return ogApi
    .patch<string>(
      `/users/filters/${id}`,
      {},
      {
        params: queryParams,
      }
    )
    .then((response) => response.data);
};

export const useEditFavouriteFilter = (): UseMutationResult<
  string,
  AxiosError,
  { id: string; favouriteFilter: FavouriteFilterPatch }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, favouriteFilter }) =>
      editFavouriteFilter(id, favouriteFilter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favouriteFilters'] });
    },
  });
};

const fetchFavouriteFilters = async (): Promise<FavouriteFilter[]> => {
  return ogApi.get(`/users/filters`).then((response) => response.data);
};

export const useFavouriteFilters = (): UseQueryResult<
  FavouriteFilter[],
  AxiosError
> => {
  return useQuery({
    queryKey: ['favouriteFilters'],
    queryFn: () => {
      return fetchFavouriteFilters();
    },
  });
};

const deleteFavouriteFilter = async (id: string): Promise<void> => {
  return ogApi.delete(`/users/filters/${id}`).then((response) => response.data);
};

export const useDeleteFavouriteFilter = (): UseMutationResult<
  void,
  AxiosError,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFavouriteFilter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favouriteFilters'] });
    },
  });
};
