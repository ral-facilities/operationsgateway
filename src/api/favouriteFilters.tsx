import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { FavouriteFilter } from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { useAppSelector } from '../state/hooks';
import { selectUrls } from '../state/slices/configSlice';

const addFavouriteFilter = (
  apiUrl: string,
  favouriteFilter: FavouriteFilter
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
  FavouriteFilter
> => {
  const { apiUrl } = useAppSelector(selectUrls);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (favouriteFilter: FavouriteFilter) =>
      addFavouriteFilter(apiUrl, favouriteFilter),
    onError: (error) => {
      console.log('Got error ' + error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favouriteFilters'] });
    },
  });
};
