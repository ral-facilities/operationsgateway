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

  const getDepsRecursively = (
    expression: FunctionToken[],
    allFunctions: ValidateFunctionState[],
    seen = new Set<string>()
  ): { channels: string[]; functions: string[] } => {
    const channels = new Set<string>();
    const functions = new Set<string>();

    expression.forEach((exp) => {
      if (exp.type === 'function' && !seen.has(exp.value)) {
        seen.add(exp.value); // Avoid infinite recursion

        const foundFunction = allFunctions.find((fn) => fn.name === exp.value);
        if (foundFunction) {
          foundFunction.channels.forEach((ch) => channels.add(ch));
          functions.add(foundFunction.name);

          const deps = getDepsRecursively(
            foundFunction.expression,
            allFunctions,
            seen
          );
          deps.channels.forEach((ch) => channels.add(ch));
          deps.functions.forEach((fn) => functions.add(fn));
        }
      }
    });

    return {
      channels: Array.from(channels),
      functions: Array.from(functions),
    };
  };

  const functions = functionStates.map(({ name, expression }) => ({
    name,
    expression: transformExpression(expression),
  }));

  const functionsWithChannels = functionStates.map(
    ({ name, expression, channels }) => {
      const { functions: depFunctions, channels: depChannels } =
        getDepsRecursively(expression, functionStates);
      return {
        name,
        expression: transformExpression(expression),
        channels: [...(channels ?? []), ...depChannels],
        functions: [name, ...depFunctions],
      };
    }
  );

  return {
    functions,
    functionsWithDeps: functionsWithChannels,
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
