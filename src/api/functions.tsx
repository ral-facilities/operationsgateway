import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import {
  APIFunctionState,
  DataType,
  FunctionToken,
  ValidateFunctionState,
} from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { useAppSelector } from '../state/hooks';
import { selectUrls } from '../state/slices/configSlice';

export function convertExpressionsToStrings(
  functionStates: ValidateFunctionState[]
): APIFunctionState {
  const channels = functionStates.flatMap((state) => state.channels);
  const uniqueChannels = Array.from(new Set(channels));

  return {
    channels: uniqueChannels,
    functions: functionStates.map((functionState) => ({
      name: functionState.name,
      expression: functionState.expression
        .map((token) => token.value.trim())
        .join(' ')
        .replace(/\s*\(\s*/g, '(')
        .replace(/\s*\)\s*/g, ')'),
    })),
  };
}

const getFunctionsTokens = (apiUrl: string): Promise<FunctionToken[]> => {
  return axios
    .get(`${apiUrl}/functions/tokens`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useGetFunctionsTokens = (): UseQueryResult<
  FunctionToken[],
  AxiosError
> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery({
    queryKey: ['FunctionTokens'],
    queryFn: () => {
      return getFunctionsTokens(apiUrl);
    },
  });
};

const postValidateFunctions = (
  apiUrl: string,
  functions: ValidateFunctionState[]
): Promise<DataType[]> => {
  const formattedFunctions = convertExpressionsToStrings(functions).functions;

  return axios
    .post(`${apiUrl}/functions/validate`, formattedFunctions, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const usePostValidateFunctions = (): UseMutationResult<
  DataType[],
  AxiosError,
  ValidateFunctionState[]
> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useMutation({
    mutationFn: (functions: ValidateFunctionState[]) => {
      return postValidateFunctions(apiUrl, functions);
    },
  });
};