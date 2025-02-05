import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  APIFunctionState,
  DataType,
  FunctionOperator,
  ValidateFunctionState,
} from '../app.types';
import { ogApi } from './api';

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
        // Remove any spaces around the open parenthesis '('
        .replace(/\s*\(\s*/g, '(')
        // Remove any spaces around the close parenthesis ')'
        .replace(/\s*\)\s*/g, ')')
        // Add a space between operators (*, +, -, /) and the following open parenthesis '('
        .replace(/([*+\-/])\(/g, '$1 (')
        // Add a space between the close parenthesis ')' and the following operators (*, +, -, /)
        .replace(/\)([*+\-/])/g, ') $1')
        // Remove any spaces around the double asterisk '**' (exponentiation operator)
        .replace(/\s*\*\*\s*/g, '**'),
    })),
  };
}

const getFunctionsTokens = async (): Promise<FunctionOperator[]> => {
  return ogApi.get(`/functions/tokens`).then((response) => {
    return response.data;
  });
};

export const useFunctionsTokens = (): UseQueryResult<
  FunctionOperator[],
  AxiosError
> => {
  return useQuery({
    queryKey: ['FunctionTokens'],
    queryFn: () => {
      return getFunctionsTokens();
    },
  });
};

const postValidateFunctions = async (
  functions: ValidateFunctionState[]
): Promise<DataType[]> => {
  const formattedFunctions = convertExpressionsToStrings(functions).functions;
  return ogApi
    .post(`/functions/validate`, formattedFunctions)
    .then((response) => response.data);
};

export const useValidateFunctions = (): UseMutationResult<
  DataType[],
  AxiosError,
  ValidateFunctionState[]
> => {
  return useMutation({
    mutationFn: (functions: ValidateFunctionState[]) => {
      return postValidateFunctions(functions);
    },
  });
};
