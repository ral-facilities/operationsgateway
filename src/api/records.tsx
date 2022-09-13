import axios, { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from 'react-query';
import {
  Channel,
  DateRange,
  ImageChannel,
  Record,
  RecordRow,
  ScalarChannel,
  SortType,
  WaveformChannel,
} from '../app.types';
import { useAppSelector } from '../state/hooks';
import { selectQueryParams } from '../state/slices/searchSlice';
import { parseISO, format } from 'date-fns';
import { selectUrls } from '../state/slices/configSlice';

const fetchRecords = async (
  apiUrl: string,
  sort: SortType,
  dateRange: DateRange,
  offsetParams?: {
    startIndex: number;
    stopIndex: number;
  }
): Promise<Record[]> => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(sort)) {
    // API recognises sort values as metadata.key or channel.key
    // Therefore, we must construct the appropriate parameter
    const sortKey = [
      'timestamp',
      'shotnum',
      'activeArea',
      'activeExperiment',
    ].includes(key)
      ? `metadata.${key}`
      : `channels.${key}`;
    params.append('order', `${sortKey} ${value}`);
  }

  if (Object.keys(dateRange).length > 0) {
    const timestampObj = {
      $and: [
        {
          'metadata.timestamp': {
            $gt: dateRange.fromDate,
            $lt: dateRange.toDate,
          },
        },
      ],
    };
    params.append('conditions', JSON.stringify(timestampObj));
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
    return records;
  });
};

const fetchRecordCountQuery = (
  apiUrl: string,
  dateRange: DateRange
): Promise<number> => {
  const params = new URLSearchParams();
  if (Object.keys(dateRange).length > 0) {
    const timestampObj = {
      $and: [
        {
          'metadata.timestamp': {
            $gt: dateRange.fromDate,
            $lt: dateRange.toDate,
          },
        },
      ],
    };
    params.append('conditions', JSON.stringify(timestampObj));
  }

  return axios
    .get(`${apiUrl}/records/count`, { params })
    .then((response) => response.data);
};

export const useRecordsPaginated = (): UseQueryResult<
  RecordRow[],
  AxiosError
> => {
  const { page, resultsPerPage, sort, dateRange } =
    useAppSelector(selectQueryParams);
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery<
    Record[],
    AxiosError,
    RecordRow[],
    [
      string,
      {
        page: number;
        resultsPerPage: number;
        sort: SortType;
        dateRange: DateRange;
      }
    ]
  >(
    ['records', { page, resultsPerPage, sort, dateRange }],
    (params) => {
      const { page, sort, dateRange } = params.queryKey[1];
      // React Table pagination is zero-based
      const startIndex = page * resultsPerPage;
      const stopIndex = startIndex + resultsPerPage - 1;
      return fetchRecords(apiUrl, sort, dateRange, { startIndex, stopIndex });
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      select: (data) =>
        data.map((record: Record) => {
          const timestampString = record.metadata.timestamp;
          const timestampDate = parseISO(timestampString);
          const formattedDate = format(timestampDate, 'yyyy-MM-dd HH:mm:ss');
          const recordRow: RecordRow = {
            timestamp: formattedDate,
            shotnum: record.metadata.shotnum,
            activeArea: record.metadata.activeArea,
            activeExperiment: record.metadata.activeExperiment,
          };

          const keys = Object.keys(record.channels);
          keys.forEach((key: string) => {
            const channel: Channel = record.channels[key];
            let channelData;
            const channelDataType = channel.metadata.channel_dtype;

            switch (channelDataType) {
              case 'scalar':
                channelData = (channel as ScalarChannel).data;
                break;
              case 'image':
                channelData = (channel as ImageChannel).thumbnail;
                channelData = (
                  <img
                    src={`data:image/jpeg;base64,${channelData}`}
                    alt={key}
                    style={{ border: '1px solid #000000' }}
                  />
                );
                break;
              case 'waveform':
                channelData = (channel as WaveformChannel).thumbnail;
                channelData = (
                  <img
                    src={`data:image/jpeg;base64,${channelData}`}
                    alt={key}
                    style={{ border: '1px solid #000000' }}
                  />
                );
            }

            recordRow[key] = channelData;
          });

          return recordRow;
        }),
    }
  );
};

// TODO: should we integrate this with useRecordsPaginated? and have options to
// pass the recordRow select function and which of the query params to apply?
export const useRecords = (): UseQueryResult<Record[], AxiosError> => {
  const { page, resultsPerPage, sort, dateRange } =
    useAppSelector(selectQueryParams);
  const { apiUrl } = useAppSelector(selectUrls);
  return useQuery<
    Record[],
    AxiosError,
    Record[],
    [
      string,
      {
        page: number;
        resultsPerPage: number;
        sort: SortType;
        dateRange: DateRange;
      }
    ]
  >(
    ['records', { page, resultsPerPage, sort, dateRange }],
    (params) => {
      const { page, sort, dateRange } = params.queryKey[1];
      // React Table pagination is zero-based
      const startIndex = page * resultsPerPage;
      const stopIndex = startIndex + resultsPerPage - 1;
      return fetchRecords(apiUrl, sort, dateRange, { startIndex, stopIndex });
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};

export const useRecordCount = (): UseQueryResult<number, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);
  const { dateRange } = useAppSelector(selectQueryParams);

  return useQuery<
    number,
    AxiosError,
    number,
    [string, { dateRange: DateRange }]
  >(
    ['recordCount', { dateRange }],
    (params) => {
      const { dateRange } = params.queryKey[1];
      return fetchRecordCountQuery(apiUrl, dateRange);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};
