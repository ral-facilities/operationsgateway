import React from 'react';
import axios, { AxiosError } from 'axios';
import { useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import {
  Channel,
  ImageChannel,
  isChannelScalar,
  PlotDataset,
  Record,
  RecordRow,
  ScalarChannel,
  SortType,
  WaveformChannel,
  SelectedPlotChannel,
  SearchParams,
} from '../app.types';
import { useAppSelector } from '../state/hooks';
import { selectQueryParams } from '../state/slices/searchSlice';
import { parseISO, format } from 'date-fns';
import { selectUrls } from '../state/slices/configSlice';
import { readSciGatewayToken } from '../parseTokens';

const fetchRecords = async (
  apiUrl: string,
  sort: SortType,
  searchParams: SearchParams,
  filters: string[],
  offsetParams?: {
    startIndex: number;
    stopIndex: number;
  }
): Promise<Record[]> => {
  const queryParams = new URLSearchParams();

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
    queryParams.append('order', `${sortKey} ${value}`);
  }

  const { dateRange, shotnumRange } = searchParams;

  let timestampObj = {};
  if (dateRange.fromDate || dateRange.toDate) {
    timestampObj = {
      'metadata.timestamp': {
        $gte: dateRange.fromDate,
        $lte: dateRange.toDate,
      },
    };
  }

  let shotnumObj = {};
  if (shotnumRange.min || shotnumRange.max) {
    shotnumObj = {
      'metadata.shotnum': {
        $gte: shotnumRange.min,
        $lte: shotnumRange.max,
      },
    };
  }

  const filtersObj = filters
    .filter((f) => f.length !== 0)
    .map((f) => JSON.parse(f));

  const searchObj = [];
  if (dateRange.fromDate || dateRange.toDate) searchObj.push(timestampObj);
  if (shotnumRange.min || shotnumRange.max) searchObj.push(shotnumObj);
  searchObj.push(...filtersObj);

  if (searchObj.length > 0) {
    queryParams.append('conditions', JSON.stringify({ $and: searchObj }));
  }

  if (offsetParams) {
    queryParams.append('skip', JSON.stringify(offsetParams.startIndex));
    queryParams.append(
      'limit',
      JSON.stringify(offsetParams.stopIndex - offsetParams.startIndex)
    );
  }

  return axios
    .get(`${apiUrl}/records`, {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      const records: Record[] = response.data;
      return records;
    });
};

const fetchRecordCountQuery = (
  apiUrl: string,
  searchParams: SearchParams,
  filters: string[]
): Promise<number> => {
  const queryParams = new URLSearchParams();

  const { dateRange, shotnumRange } = searchParams;

  let timestampObj = {};
  if (dateRange.fromDate || dateRange.toDate) {
    timestampObj = {
      'metadata.timestamp': {
        $gte: dateRange.fromDate,
        $lte: dateRange.toDate,
      },
    };
  }

  let shotnumObj = {};
  if (shotnumRange.min || shotnumRange.max) {
    shotnumObj = {
      'metadata.shotnum': {
        $gte: shotnumRange.min,
        $lte: shotnumRange.max,
      },
    };
  }

  const filtersObj = filters
    .filter((f) => f.length !== 0)
    .map((f) => JSON.parse(f));

  const searchObj = [];
  if (dateRange.fromDate || dateRange.toDate) searchObj.push(timestampObj);
  if (shotnumRange.min || shotnumRange.max) searchObj.push(shotnumObj);
  searchObj.push(...filtersObj);

  if (searchObj.length > 0) {
    queryParams.append('conditions', JSON.stringify({ $and: searchObj }));
  }

  return axios
    .get(`${apiUrl}/records/count`, {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => response.data);
};

export const useRecordsPaginated = (): UseQueryResult<
  RecordRow[],
  AxiosError
> => {
  const { searchParams, page, resultsPerPage, sort, filters } =
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
        searchParams: SearchParams;
        filters: string[];
      }
    ]
  >(
    ['records', { page, resultsPerPage, sort, searchParams, filters }],
    (params) => {
      const { page, resultsPerPage, sort, searchParams, filters } =
        params.queryKey[1];
      // React Table pagination is zero-based
      const startIndex = page * resultsPerPage;
      const stopIndex = startIndex + resultsPerPage;
      return fetchRecords(apiUrl, sort, searchParams, filters, {
        startIndex,
        stopIndex,
      });
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      select: (data: Record[]) =>
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

export const getFormattedAxisData = (
  record: Record,
  axisName: string
): number => {
  let formattedData = NaN;

  switch (axisName) {
    case 'timestamp':
      formattedData = parseISO(record.metadata.timestamp).getTime();
      break;
    case 'shotnum':
      formattedData = record.metadata.shotnum ?? NaN;
      break;
    case 'activeArea':
      formattedData = parseInt(record.metadata.activeArea);
      break;
    case 'activeExperiment':
      formattedData = record.metadata.activeExperiment
        ? parseInt(record.metadata.activeExperiment)
        : NaN;
      break;
    default:
      const channel = record.channels[axisName];
      if (isChannelScalar(channel)) {
        formattedData =
          typeof channel.data === 'number'
            ? channel.data
            : parseFloat(channel.data);
      }
  }

  return formattedData;
};

export const usePlotRecords = (
  selectedPlotChannels: SelectedPlotChannel[],
  XAxis?: string
): UseQueryResult<PlotDataset[], AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);
  const { searchParams, filters } = useAppSelector(selectQueryParams);
  const parsedXAxis = XAxis ?? 'timestamp';

  return useQuery<
    Record[],
    AxiosError,
    PlotDataset[],
    [string, { sort: SortType; searchParams: SearchParams; filters: string[] }]
  >(
    ['records', { sort: { [parsedXAxis]: 'asc' }, searchParams, filters }],
    (params) => {
      const { sort, filters, searchParams } = params.queryKey[1];
      const { maxShots } = searchParams;
      let offsetParams = undefined;
      if (maxShots !== Infinity) {
        offsetParams = {
          startIndex: 0,
          stopIndex: maxShots,
        };
      }
      return fetchRecords(apiUrl, sort, searchParams, filters, offsetParams);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      select: (records: Record[]) => {
        const plotDatasets = selectedPlotChannels.map((plotChannel) => {
          const plotChannelName = plotChannel.name;

          // Add the initial entry for dataset called plotChannelName
          // data field is currently empty, the below loop populates it
          const newDataset: PlotDataset = {
            name: plotChannelName,
            data: [],
          };

          // Populate the above data field
          records.forEach((record) => {
            const formattedXAxis = getFormattedAxisData(record, parsedXAxis);
            const formattedYAxis = getFormattedAxisData(
              record,
              plotChannelName
            );

            if (formattedXAxis && formattedYAxis) {
              const currentData = newDataset.data;
              currentData.push({
                [parsedXAxis]: formattedXAxis,
                [plotChannelName]: formattedYAxis,
              });
            }
          });

          return newDataset;
        });

        return plotDatasets;
      },
    }
  );
};

export const useRecordCount = (): UseQueryResult<number, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);
  const { searchParams, filters } = useAppSelector(selectQueryParams);
  const queryClient = useQueryClient();

  return useQuery<
    number,
    AxiosError,
    number,
    [string, { searchParams: SearchParams; filters: string[] }]
  >(
    ['recordCount', { searchParams, filters }],
    (params) => {
      const { searchParams, filters } = params.queryKey[1];
      return fetchRecordCountQuery(apiUrl, searchParams, filters);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      initialData: () =>
        queryClient.getQueryData([
          'incomingRecordCount',
          {
            searchParams,
            filters,
          },
        ]),
    }
  );
};

export const useIncomingRecordCount = (
  filters?: string[],
  searchParams?: SearchParams
): UseQueryResult<number, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);
  const { filters: storeFilters, searchParams: storeSearchParams } =
    useAppSelector(selectQueryParams);

  let finalisedFilters: string[];
  if (filters) {
    finalisedFilters = filters;
  } else {
    finalisedFilters = storeFilters;
  }

  let finalisedSearchParams: SearchParams;
  if (searchParams) {
    finalisedSearchParams = searchParams;
  } else {
    finalisedSearchParams = storeSearchParams;
  }

  return useQuery<
    number,
    AxiosError,
    number,
    [string, { searchParams: SearchParams; filters: string[] }]
  >(
    [
      'incomingRecordCount',
      { searchParams: finalisedSearchParams, filters: finalisedFilters },
    ],
    (params) => {
      const { searchParams, filters } = params.queryKey[1];
      return fetchRecordCountQuery(apiUrl, searchParams, filters);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};
