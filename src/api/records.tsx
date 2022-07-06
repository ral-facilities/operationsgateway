import { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from 'react-query';
import { QueryParams, Record, SortType, DateRange } from '../app.types';
import {
  generateRecordCollection,
  randomNumber,
  resultsPerPage,
} from '../recordGeneration';

const sleep = (ms: number): Promise<unknown> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const recordCollection = generateRecordCollection();

// TODO change this when we have an API to query
const fetchRecords = async (
  page: number,
  sort?: SortType,
  startDateRange?: DateRange,
  endDateRange?: DateRange
): Promise<Record[]> => {
  page += 1; // React Table pagination is zero-based so adding 1 to page number to correctly calculate endIndex
  const endIndex = page * resultsPerPage;
  const startIndex = endIndex - resultsPerPage;
  await sleep(randomNumber(0, 1000));
  return Promise.resolve(recordCollection.slice(startIndex, endIndex));
};

const fetchRecordCountQuery = (): Promise<number> => {
  return Promise.resolve(recordCollection.length);
};

export const useRecordsPaginated = (
  queryParams: QueryParams
): UseQueryResult<Record[], AxiosError> => {
  const { page, sort, dateRange } = queryParams;
  return useQuery<
    Record[],
    AxiosError,
    Record[],
    [
      string,
      {
        page: number;
        sort?: SortType;
        dateRange?: DateRange;
      }
    ]
  >(
    ['records', { page, sort, dateRange }],
    (params) => {
      const { page, sort, dateRange } = params.queryKey[1];
      return fetchRecords(page, sort, dateRange);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};

export const useRecordCount = (): UseQueryResult<number, AxiosError> => {
  return useQuery<number, AxiosError, number, [string]>(
    ['recordCount'],
    () => {
      return fetchRecordCountQuery();
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};
