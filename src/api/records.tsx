import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { parseISO } from 'date-fns';
import {
  APIFunctionState,
  DateRangetoShotnumConverter,
  isChannelImage,
  isChannelScalar,
  isChannelWaveform,
  PlotDataset,
  Record,
  RecordRow,
  SearchParams,
  SelectedPlotChannel,
  SortType,
  timeChannelName,
} from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { useAppSelector } from '../state/hooks';
import { selectUrls } from '../state/slices/configSlice';
import { selectQueryParams } from '../state/slices/searchSlice';
import { selectSelectedIdsIgnoreOrder } from '../state/slices/tableSlice';
import { renderTimestamp } from '../table/cellRenderers/cellContentRenderers';
import { staticChannels } from './channels';

const fetchRecords = async (
  apiUrl: string,
  sort: SortType,
  searchParams: SearchParams,
  filters: string[],
  functionsState: APIFunctionState,
  offsetParams?: {
    startIndex: number;
    stopIndex: number;
  },
  projection?: string[]
): Promise<Record[]> => {
  const queryParams = new URLSearchParams();

  // TODO: needs a proper fix (probably with a default sort)
  if (Object.keys(sort).length === 0) {
    sort = { timestamp: 'asc' };
  }

  for (const [key, value] of Object.entries(sort)) {
    // API recognises sort values as metadata.key or channel.key
    // Therefore, we must construct the appropriate parameter
    const sortKey =
      key in staticChannels ? `metadata.${key}` : `channels.${key}`;
    queryParams.append('order', `${sortKey} ${value}`);
  }

  const { dateRange } = searchParams;

  let timestampObj = {};
  if (dateRange.fromDate || dateRange.toDate) {
    timestampObj = {
      'metadata.timestamp': {
        $gte: dateRange.fromDate,
        $lte: dateRange.toDate,
      },
    };
  }

  const filtersObj = filters
    .filter((f) => f.length !== 0)
    .map((f) => JSON.parse(f));

  const searchObj = [];
  if (dateRange.fromDate || dateRange.toDate) searchObj.push(timestampObj);

  searchObj.push(...filtersObj);

  const existsConditions: { [x: string]: { $exists: boolean } }[] = [];

  projection?.forEach((channel) => {
    // Do not project on functions
    let is_function = false;
    functionsState.functions.forEach((func) => {
      if (channel === func.name) is_function = true;
    });
    if (!is_function) {
      // API recognises projection values as metadata.key or channel.key
      // Therefore, we must construct the appropriate parameter
      const key =
        channel in staticChannels
          ? `metadata.${channel}`
          : `channels.${channel}`;
      queryParams.append('projection', key);

      if (!(channel in staticChannels)) {
        existsConditions.push({ [key]: { $exists: true } });
      }
    }
  });

  functionsState.functions.forEach((func) => {
    queryParams.append('functions', JSON.stringify(func));
  });

  functionsState.channels.forEach((channel) => {
    if (!projection?.includes(channel)) {
      existsConditions.push({ [`channels.${channel}`]: { $exists: true } });
    }
  });

  if (existsConditions.length > 0 || searchObj.length > 0) {
    const query =
      existsConditions.length > 0 && searchObj.length > 0
        ? { $and: searchObj, $or: existsConditions }
        : existsConditions.length > 0
          ? { $or: existsConditions }
          : { $and: searchObj };

    queryParams.append('conditions', JSON.stringify(query));
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
  filters: string[],
  functionsState: APIFunctionState,
  projection?: string[]
): Promise<number> => {
  const queryParams = new URLSearchParams();

  const { dateRange } = searchParams;

  let timestampObj = {};
  if (dateRange.fromDate || dateRange.toDate) {
    timestampObj = {
      'metadata.timestamp': {
        $gte: dateRange.fromDate,
        $lte: dateRange.toDate,
      },
    };
  }

  const filtersObj = filters
    .filter((f) => f.length !== 0)
    .map((f) => JSON.parse(f));

  const searchObj = [];
  if (dateRange.fromDate || dateRange.toDate) searchObj.push(timestampObj);

  searchObj.push(...filtersObj);

  const existsConditions: { [x: string]: { $exists: boolean } }[] = [];

  projection?.forEach((channel) => {
    // Do not project on functions
    let is_function = false;
    functionsState.functions.forEach((func) => {
      if (channel === func.name) is_function = true;
    });
    if (!is_function) {
      // API recognises projection values as metadata.key or channel.key
      // Therefore, we must construct the appropriate parameter
      const key =
        channel in staticChannels
          ? `metadata.${channel}`
          : `channels.${channel}`;

      if (!(channel in staticChannels)) {
        existsConditions.push({ [key]: { $exists: true } });
      }
    }
  });

  functionsState.channels.forEach((channel) => {
    if (!projection?.includes(channel)) {
      existsConditions.push({ [`channels.${channel}`]: { $exists: true } });
    }
  });

  if (existsConditions.length > 0 || searchObj.length > 0) {
    const query =
      existsConditions.length > 0 && searchObj.length > 0
        ? { $and: searchObj, $or: existsConditions }
        : existsConditions.length > 0
          ? { $or: existsConditions }
          : { $and: searchObj };

    queryParams.append('conditions', JSON.stringify(query));
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

export const fetchRangeRecordConverterQuery = (
  apiUrl: string,
  fromDate: string | undefined,
  toDate: string | undefined,
  shotnumMin: number | undefined,
  shotnumMax: number | undefined
): Promise<DateRangetoShotnumConverter> => {
  const queryParams = new URLSearchParams();
  let timestampObj = {};
  if (fromDate || toDate) {
    timestampObj = {
      from: fromDate,
      to: toDate,
    };
  }

  if (fromDate || toDate) {
    queryParams.append('date_range', JSON.stringify(timestampObj));
  }

  let shotnumObj = {};
  if (shotnumMin || shotnumMax) {
    shotnumObj = {
      min: shotnumMin,
      max: shotnumMax,
    };
  }

  if (shotnumMin || shotnumMax) {
    queryParams.append('shotnum_range', JSON.stringify(shotnumObj));
  }

  return axios
    .get(`${apiUrl}/records/range_converter`, {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      if (response.data) {
        let inputRange;
        if (fromDate || toDate) {
          inputRange = { from: fromDate, to: toDate };
        }
        if (shotnumMin || shotnumMax) {
          inputRange = { min: shotnumMin, max: shotnumMax };
        }
        return { ...inputRange, ...response.data };
      }
    });
};

export const useDateToShotnumConverter = (
  fromDate: string | undefined,
  toDate: string | undefined,
  enabled?: boolean
): UseQueryResult<DateRangetoShotnumConverter, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery({
    queryKey: ['dateToShotnumConverter', { fromDate, toDate }],

    queryFn: () => {
      return fetchRangeRecordConverterQuery(
        apiUrl,
        fromDate,
        toDate,
        undefined,
        undefined
      );
    },

    enabled,
  });
};

export const useShotnumToDateConverter = (
  shotnumMin: number | undefined,
  shotnumMax: number | undefined,
  enabled?: boolean
): UseQueryResult<DateRangetoShotnumConverter, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery({
    queryKey: ['shotnumToDateConverter', { shotnumMin, shotnumMax }],
    queryFn: () =>
      fetchRangeRecordConverterQuery(
        apiUrl,
        undefined,
        undefined,
        shotnumMin,
        shotnumMax
      ),
    enabled,
  });
};
export const useRecordsPaginated = (): UseQueryResult<
  RecordRow[],
  AxiosError
> => {
  const { searchParams, page, resultsPerPage, sort, filters, functions } =
    useAppSelector(selectQueryParams);
  const { apiUrl } = useAppSelector(selectUrls);
  const projection = useAppSelector(selectSelectedIdsIgnoreOrder);

  return useQuery({
    queryKey: [
      'records',
      {
        page,
        resultsPerPage,
        sort: JSON.stringify(sort), // need to stringify sort as property order is important!
        searchParams,
        filters,
        functions,
        projection,
      },
    ],

    queryFn: ({ queryKey }) => {
      const { page, resultsPerPage, searchParams, filters, functions } =
        queryKey[1] as {
          page: number;
          resultsPerPage: number;
          sort: string;
          searchParams: SearchParams;
          filters: string[];
          functions: APIFunctionState;
          projection: string[];
        };

      // React Table pagination is zero-based
      const startIndex = page * resultsPerPage;
      const stopIndex = startIndex + resultsPerPage;
      return fetchRecords(
        apiUrl,
        sort,
        searchParams,
        filters,
        functions,
        {
          startIndex,
          stopIndex,
        },
        projection
      );
    },

    select: (data: Record[]) =>
      data.map((record: Record) => {
        const timestampString = record.metadata.timestamp;
        const formattedDate = renderTimestamp(timestampString);
        const recordRow: RecordRow = {
          _id: record._id,
          timestamp: formattedDate,
          shotnum: record.metadata.shotnum,
          activeArea: record.metadata.activeArea,
          activeExperiment: record.metadata.activeExperiment,
        };

        const keys = Object.keys(record.channels ?? {});
        keys.forEach((key: string) => {
          const channel = record.channels?.[key];

          if (channel) {
            let channelData;

            if (isChannelScalar(channel)) {
              channelData = channel.data;
            } else if (isChannelImage(channel) || isChannelWaveform(channel)) {
              channelData = channel.thumbnail;
            }

            recordRow[key] = channelData;
          }
        });

        return recordRow;
      }),
  });
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
      formattedData = record.metadata.activeArea
        ? parseInt(record.metadata.activeArea)
        : NaN;
      break;
    case 'activeExperiment':
      formattedData = record.metadata.activeExperiment
        ? parseInt(record.metadata.activeExperiment)
        : NaN;
      break;
    default: {
      const channel = record.channels?.[axisName];
      if (isChannelScalar(channel)) {
        formattedData =
          typeof channel.data === 'number'
            ? channel.data
            : parseFloat(channel.data);
      }
    }
  }

  return formattedData;
};

export const usePlotRecords = (
  selectedPlotChannels: SelectedPlotChannel[],
  XAxis?: string
): UseQueryResult<PlotDataset[], AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);
  const { searchParams, filters, functions } =
    useAppSelector(selectQueryParams);
  const parsedXAxis = XAxis ?? timeChannelName;

  const projection = [
    parsedXAxis,
    ...selectedPlotChannels.map((channel) => channel.name),
  ];

  return useQuery({
    queryKey: [
      'records',
      {
        sort: { [parsedXAxis]: 'asc' },
        searchParams,
        filters,
        functions,
        projection,
      },
    ],

    queryFn: ({ queryKey }) => {
      const { sort, filters, functions, searchParams } = queryKey[1] as {
        sort: { [x: string]: string };
        searchParams: SearchParams;
        filters: string[];
        functions: APIFunctionState;
        projection: string[];
      };

      const { maxShots } = searchParams;
      let offsetParams = undefined;
      if (maxShots !== Infinity) {
        offsetParams = {
          startIndex: 0,
          stopIndex: maxShots,
        };
      }
      return fetchRecords(
        apiUrl,
        sort as SortType,
        searchParams,
        filters,
        functions,
        offsetParams,
        projection
      );
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
          const formattedYAxis = getFormattedAxisData(record, plotChannelName);

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
  });
};

export const useThumbnails = (
  channel: string,
  page: number,
  resultsPerPage: number
): UseQueryResult<Record[], AxiosError> => {
  const { searchParams, sort, filters, functions } =
    useAppSelector(selectQueryParams);
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery({
    queryKey: [
      'thumbnails',
      channel,
      {
        page,
        resultsPerPage,
        sort: JSON.stringify(sort), // need to stringify sort as property order is important!
        searchParams,
        filters,
        functions,
      },
    ],

    queryFn: (params) => {
      const { page, resultsPerPage, searchParams, filters, functions } = params
        .queryKey[2] as {
        page: number;
        resultsPerPage: number;
        sort: string;
        searchParams: SearchParams;
        filters: string[];
        functions: APIFunctionState;
      };

      // React Table pagination is zero-based
      const startIndex = page * resultsPerPage;
      const stopIndex = startIndex + resultsPerPage;
      return fetchRecords(
        apiUrl,
        sort,
        searchParams,
        filters,
        functions,
        {
          startIndex,
          stopIndex,
        },
        [channel, timeChannelName]
      );
    },
  });
};

export const useRecordCount = (): UseQueryResult<number, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);
  const { searchParams, filters, functions } =
    useAppSelector(selectQueryParams);
  const queryClient = useQueryClient();
  const projection = useAppSelector(selectSelectedIdsIgnoreOrder);

  return useQuery({
    queryKey: ['recordCount', { searchParams, filters, projection, functions }],

    queryFn: (params) => {
      const { searchParams, filters, functions, projection } = params
        .queryKey[1] as {
        searchParams: SearchParams;
        filters: string[];
        functions: APIFunctionState;
        projection: string[];
      };
      return fetchRecordCountQuery(
        apiUrl,
        searchParams,
        filters,
        functions,
        projection
      );
    },

    initialData: () =>
      queryClient.getQueryData([
        'incomingRecordCount',
        {
          searchParams,
          filters,
          projection,
          functions,
        },
      ]),
  });
};

export const useIncomingRecordCount = (
  filters?: string[],
  searchParams?: SearchParams
): UseQueryResult<number, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);
  const {
    filters: storeFilters,
    searchParams: storeSearchParams,
    functions,
  } = useAppSelector(selectQueryParams);

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

  return useQuery({
    queryKey: [
      'incomingRecordCount',
      {
        searchParams: finalisedSearchParams,
        filters: finalisedFilters,
        projection: [timeChannelName],
        functions: functions,
      },
    ],

    queryFn: (params) => {
      const { searchParams, filters, functions, projection } = params
        .queryKey[1] as {
        searchParams: SearchParams;
        filters: string[];
        functions: APIFunctionState;
        projection: string[];
      };

      return fetchRecordCountQuery(
        apiUrl,
        searchParams,
        filters,
        functions,
        projection
      );
    },
  });
};
