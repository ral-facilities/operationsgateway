import { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from 'react-query';
import { Channel, Record, RecordRow, SortType, DateRange } from '../app.types';
import { generateRecordCollection, randomNumber } from '../recordGeneration';
import { useAppSelector } from '../state/hooks';
import { selectQueryParams } from '../state/slices/searchSlice';

const sleep = (ms: number): Promise<unknown> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const recordCollection = generateRecordCollection();

// TODO change this when we have an API to query
const fetchRecords = async (
  page: number,
  resultsPerPage: number,
  sort?: SortType,
  dateRange?: DateRange
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

export const useRecordsPaginated = (): UseQueryResult<
  RecordRow[],
  AxiosError
> => {
  const { page, resultsPerPage, sort, dateRange } =
    useAppSelector(selectQueryParams);
  return useQuery<
    Record[],
    AxiosError,
    RecordRow[],
    [
      string,
      {
        page: number;
        resultsPerPage: number;
        sort?: SortType;
        dateRange?: DateRange;
      }
    ]
  >(
    ['records', { page, resultsPerPage, sort, dateRange }],
    (params) => {
      const { page, resultsPerPage, sort, dateRange } = params.queryKey[1];
      return fetchRecords(page, resultsPerPage, sort, dateRange);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      select: (data) => {
        let newData: RecordRow[] = [];

        data.forEach((record: Record) => {
          let recordRow: RecordRow = {
            timestamp: record.metadata.timestamp,
            shotNum: record.metadata.shotNum,
            activeArea: record.metadata.activeArea,
            activeExperiment: record.metadata.activeExperiment,
          };

          const keys = Object.keys(record.channels);
          keys.forEach((key: string) => {
            const channel: Channel = record.channels[key];
            const channelData = channel.data;
            recordRow[key] = channelData;
          });

          newData.push(recordRow);
        });

        return newData;
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
