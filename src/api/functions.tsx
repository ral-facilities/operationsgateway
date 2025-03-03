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
  FunctionToken,
  ValidateFunctionState,
} from '../app.types';
import { ogApi } from './api';

export function convertExpressionsToStrings(
  functionStates: ValidateFunctionState[]
): APIFunctionState {
  const transformExpression = (expressionTokens: FunctionToken[]): string =>
    expressionTokens
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
      .replace(/\s*\*\*\s*/g, '**');

  const functions = functionStates.map(({ name, expression }) => ({
    name,
    expression: transformExpression(expression),
  }));

  const functionsWithChannels = functionStates.map(
    ({ name, expression, channels }) => ({
      name,
      expression: transformExpression(expression),
      channels,
    })
  );

  return {
    functions,
    functionsWithChannels,
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
