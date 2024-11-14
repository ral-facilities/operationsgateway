import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { FavouriteFilter, FavouriteFilterPost } from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { useAppSelector } from '../state/hooks';
import { selectUrls } from '../state/slices/configSlice';

const addFavouriteFilter = (
  apiUrl: string,
  favouriteFilter: FavouriteFilterPost
): Promise<string> => {
  const queryParams = new URLSearchParams();

  queryParams.append('name', favouriteFilter.name);
  queryParams.append('filter', favouriteFilter.filter);

  return axios
    .post<string>(
      `${apiUrl}/users/filters`,
      {},
      {
        params: queryParams,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken()}`,
        },
      }
    )
    .then((response) => response.data);
};

export const useAddFavouriteFilter = (): UseMutationResult<
  string,
  AxiosError,
  FavouriteFilterPost
> => {
  const { apiUrl } = useAppSelector(selectUrls);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (favouriteFilter: FavouriteFilterPost) =>
      addFavouriteFilter(apiUrl, favouriteFilter),
    onError: (error) => {
      console.log('Got error ' + error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favouriteFilters'] });
    },
  });
};

const fetchFavouriteFilters = (apiUrl: string): Promise<FavouriteFilter[]> => {
  return axios
    .get(`${apiUrl}/users/filters`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useFavouriteFilters = (): UseQueryResult<
  FavouriteFilter[],
  AxiosError
> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery({
    queryKey: ['favouriteFilters'],

    queryFn: () => {
      return fetchFavouriteFilters(apiUrl);
    },
  });
};
