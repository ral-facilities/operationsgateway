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
import { generateActualChannelMetadata } from './channels';
import { parseISO, format } from 'date-fns';

// TODO fetch this with useSelector when Redux is available
const apiUrl = 'http://opsgateway-epac-dev.clf.stfc.ac.uk:8000';

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
        sort: SortType;
        dateRange?: DateRange;
      }
    ]
  >(
    ['records', { page, resultsPerPage, sort, dateRange }],
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
      select: (data) =>
        data.map((record: Record) => {
          const timestampString = record.metadata.timestamp;
          const timestampDate = parseISO(timestampString);
          const formattedDate = format(timestampDate, 'yyyy-MM-dd HH:mm:ss');
          let recordRow: RecordRow = {
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
                // TODO make this a thumbnail later to access a larger version of image
                channelData = (
                  <img
                    src={`data:image/jpeg;base64,${channelData}`}
                    alt={key}
                  />
                );
                break;
              case 'waveform':
                channelData = (channel as WaveformChannel).thumbnail;
                // TODO make this a thumbnail later to access a larger version of image
                channelData = (
                  <img
                    src={`data:image/jpeg;base64,${channelData}`}
                    alt={key}
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
