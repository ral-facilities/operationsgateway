import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios, { AxiosError, isAxiosError } from 'axios';
import { readSciGatewayToken } from '../parseTokens';
import { useAppSelector } from '../state/hooks';
import { selectUrls } from '../state/slices/configSlice';

// make all these functions generic, as we can store multiple types as user preferences

export const fetchUserPreference = async <T,>(
  apiUrl: string,
  name: string
): Promise<T | null> => {
  return axios
    .get(`${apiUrl}/users/preferences/${name}`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      // 404 means no preference is set - so interpret this as null
      if (isAxiosError(error) && error.response?.status === 404) {
        return null;
      } else {
        throw error;
      }
    });
};

export const useUserPreference = <T,>(
  name: string
): UseQueryResult<T | null, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery(
    ['userPreference', name],
    (params) => {
      return fetchUserPreference<T>(apiUrl, name);
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
      `${apiUrl}/users/preferences`,
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

export const deleteUserPreference = async (
  apiUrl: string,
  name: string
): Promise<null> => {
  return axios
    .delete(`${apiUrl}/users/preferences/${name}`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useUpdateUserPreference = <T,>(
  name: string
): UseMutationResult<T | null, AxiosError, { value: T }> => {
  const queryClient = useQueryClient();
  const { apiUrl } = useAppSelector(selectUrls);

  return useMutation(
    ({ value }: { value: T }) => {
      if (value !== null) {
        return updateUserPreference(apiUrl, name, value);
      } else {
        return deleteUserPreference(apiUrl, name);
      }
    },
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
