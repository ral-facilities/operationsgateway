import axios, { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from 'react-query';
import { QueryParams, Record, SortType, DateRange } from '../app.types';
import { generateActualChannelMetadata } from './channels';

// TODO fetch this with useSelector when Redux is available
const apiUrl = 'http://opsgateway-epac-dev.clf.stfc.ac.uk:8000';

// TODO this needs to be somewhere else. Perhaps a setting?
const resultsPerPage = 25;

// TODO change this when we have an API to query
const fetchRecords = async (
  sort: SortType,
  dateRange?: DateRange,
  offsetParams?: {
    startIndex: number;
    stopIndex: number;
  }
): Promise<Record[]> => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(sort)) {
    params.append('order', `${key} ${value}`);
  }

  if (offsetParams) {
    params.append('skip', JSON.stringify(offsetParams.startIndex));
    params.append(
      'limit',
      JSON.stringify(offsetParams.stopIndex - offsetParams.startIndex + 1)
    );
  }

  return axios.get(`${apiUrl}/records`, { params }).then((response) => {
    const records: Record[] = response.data;
    generateActualChannelMetadata(records);
    return records;
  });
};

const fetchRecordCountQuery = (): Promise<number> => {
  return axios.get(`${apiUrl}/records/count`).then((response) => response.data);
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
        sort: SortType;
        dateRange?: DateRange;
      }
    ]
  >(
    ['records', { page, sort, dateRange }],
    (params) => {
      let { page, sort, dateRange } = params.queryKey[1];
      page += 1; // React Table pagination is zero-based so adding 1 to page number to correctly calculate endIndex
      const startIndex = (page - 1) * resultsPerPage;
      const stopIndex = startIndex + resultsPerPage - 1;
      return fetchRecords(sort, dateRange, { startIndex, stopIndex });
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
