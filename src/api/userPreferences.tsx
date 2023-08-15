import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { readSciGatewayToken } from '../parseTokens';
import { useAppSelector } from '../state/hooks';
import { selectUrls } from '../state/slices/configSlice';

// make all these functions generic, as we can store multiple types as user preferences

export const fetchUserPreference = async <T,>(
  apiUrl: string,
  name: string
): Promise<T> => {
  return axios
    .get(`${apiUrl}/user_preferences/${name}`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useUserPreference = <T,>(
  name: string
): UseQueryResult<T, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery<T, AxiosError, T, [string, string]>(
    ['userPreference', name],
    (params) => {
      return fetchUserPreference(apiUrl, name);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};

export const updateUserPreference = async <T,>(
  apiUrl: string,
  name: string,
  value: T
): Promise<T> => {
  return axios
    .post(
      `${apiUrl}/user_preferences`,
      { name, value },
      {
        headers: {
          Authorization: `Bearer ${readSciGatewayToken()}`,
        },
      }
    )
    .then((response) => {
      return response.data;
    });
};

export const useUpdateUserPreference = <T,>(
  name: string
): UseMutationResult<T, AxiosError, { value: T }> => {
  const queryClient = useQueryClient();
  const { apiUrl } = useAppSelector(selectUrls);

  return useMutation(
    ({ value }: { value: T }) => updateUserPreference(apiUrl, name, value),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      onSuccess: (data, vars) => {
        queryClient.setQueryData(['userPreference', name], vars.value);
      },
    }
  );
};
