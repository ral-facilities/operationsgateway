import axios, { AxiosError } from 'axios';
import { DataType, FunctionItem, FunctionToken } from '../app.types';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { selectUrls } from '../state/slices/configSlice';
import { useAppSelector } from '../state/hooks';
import { readSciGatewayToken } from '../parseTokens';
import { Token } from '../filtering/filterParser';

const fetchTokens = (apiUrl: string): Promise<Token[]> => {
  return axios
    .get(`${apiUrl}/functions/tokens`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      return response.data.map((token: FunctionToken) => ({
        label: token.name,
        value: token.symbol,
        type: 'string', // TODO sort this
      }));
    });
};

const fetchFunctionReturnType = (
  apiUrl: string,
  index: number,
  functionItems: FunctionItem[]
): Promise<DataType> => {
  const queryParams = new URLSearchParams();
  const pairs: string[][] = [];
  functionItems.forEach((functionItem, i) => {
    if (i === index) {
      let expression = '';
      functionItem.expression.forEach((token) => {
        expression += token.value;
      });
      queryParams.append(
        'function',
        JSON.stringify({ ...functionItem, expression: expression })
      );
    }
    pairs.push([functionItem.name, functionItem.returnType ?? '']);
  });

  queryParams.append(
    'function_types',
    JSON.stringify(Object.fromEntries(pairs))
  );
  return axios
    .get(`${apiUrl}/functions`, {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      return response.data as DataType;
    });
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const useTokens = <T extends unknown = Token[]>(): UseQueryResult<
  T,
  AxiosError
> => {
  const { apiUrl } = useAppSelector(selectUrls);
  return useQuery(
    ['tokens'],
    (params) => {
      return fetchTokens(apiUrl);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const useFunctionReturnType = <T extends unknown = DataType>(
  index: number,
  functionItems: FunctionItem[]
): UseQueryResult<T, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);
  return useQuery(
    ['functionReturnType'],
    (params) => {
      return fetchFunctionReturnType(apiUrl, index, functionItems);
    // },
    // {
    //   onError: (error) => {
    //     console.log('Got error ' + error.message);
    //   },
    }
  );
};
