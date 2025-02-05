import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError, isAxiosError } from 'axios';
import { ogApi } from './api';

// make all these functions generic, as we can store multiple types as user preferences

export const fetchUserPreference = async <T,>(
  name: string
): Promise<T | null> => {
  return ogApi
    .get(`/users/preferences/${name}`)
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
  return useQuery({
    queryKey: ['userPreference', name],
    queryFn: () => {
      return fetchUserPreference<T>(name);
    },
  });
};

export const updateUserPreference = async <T,>(
  name: string,
  value: T
): Promise<T> => {
  return ogApi.post(`/users/preferences`, { name, value }).then((response) => {
    return response.data;
  });
};

export const deleteUserPreference = async (name: string): Promise<null> => {
  return ogApi.delete(`/users/preferences/${name}`).then((response) => {
    return response.data;
  });
};

export const useUpdateUserPreference = <T,>(
  name: string
): UseMutationResult<T | null, AxiosError, { value: T }> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ value }: { value: T }) => {
      if (value !== null) {
        return updateUserPreference(name, value);
      } else {
        return deleteUserPreference(name);
      }
    },
    onSuccess: (_data, vars) => {
      queryClient.setQueryData(['userPreference', name], vars.value);
    },
  });
};
