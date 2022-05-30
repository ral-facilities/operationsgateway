import { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from 'react-query';
import { QueryParams, Record, SortType } from '../app.types';

const resultsPerPage = 10;

const randomDate = (): Date => {
  const start = new Date(2024, 0, 1);
  const end = new Date(2026, 11, 31);

  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const generateRecord = (): Record => {
  return {
    shotId: randomNumber(100, 999),
    timestamp: randomDate().toISOString(),
    activeArea: `Area${randomNumber(100, 999).toString()}`,
    activeExperiment: `ABC${randomNumber(100, 999).toString()}DEF`,
  };
};

const generateRecordCollection = (): Record[] => {
  let records: Record[] = [];
  const random = randomNumber(resultsPerPage * 3, resultsPerPage * 10);

  for (let i = 0; i < random; i++) {
    records.push(generateRecord());
  }

  return records;
};

const sleep = (ms: number): Promise<unknown> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const recordCollection = generateRecordCollection();

// TODO change this when we have an API to query
const fetchRecords = async (
  page: number,
  sort: SortType
): Promise<Record[]> => {
  page += 1; // React Table pagination is zero-based so adding 1 to page number to correctly calculate endIndex
  const endIndex = page * resultsPerPage;
  const startIndex = endIndex - 10;
  await sleep(randomNumber(0, 1000));
  return Promise.resolve(recordCollection.slice(startIndex, endIndex));
};

const fetchRecordCountQuery = (): Promise<number> => {
  return Promise.resolve(recordCollection.length);
};

export const useRecordsPaginated = (
  queryParams: QueryParams
): UseQueryResult<Record[], AxiosError> => {
  const { page, sort } = queryParams;
  return useQuery<
    Record[],
    AxiosError,
    Record[],
    [string, { page: number; sort: SortType }]
  >(
    ['records', { page: page ?? 0, sort }],
    (params) => {
      const { page, sort } = params.queryKey[1];
      return fetchRecords(page, sort);
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
