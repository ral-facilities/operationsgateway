import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  APIFunctionState,
  DateRangetoShotnumConverter,
  isChannelFloatImage,
  isChannelImage,
  isChannelScalar,
  isChannelVector,
  isChannelWaveform,
  PlotDataset,
  Record,
  RecordRow,
  SearchParams,
  SelectedPlotChannel,
  ShotNumType,
  SortType,
  timeChannelName,
} from '../app.types';
import { useAppSelector } from '../state/hooks';
import { selectQueryParams } from '../state/slices/searchSlice';
import { selectSelectedIdsIgnoreOrder } from '../state/slices/tableSlice';
import { renderTimestamp } from '../table/cellRenderers/cellContentRenderers';
import { convertApiTimestampToDate, ogApi } from './api';
import { staticChannels } from './channels';

const fetchRecords = async (
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

  const { dateRange, dataTypes } = searchParams;

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
  if (dataTypes) searchObj.push({ 'metadata.active_area': { $in: dataTypes } });

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

      if (channel !== timeChannelName) {
        existsConditions.push({ [key]: { $exists: true } });
      }
    }
  });

  const functionDepFunctions = new Set(
    functionsState.functionsWithDeps
      .filter((func) => projection?.includes(func.name))
      .flatMap((func) => func.functions)
  );

  functionsState.functions.forEach((func) => {
    if (Array.from(functionDepFunctions).includes(func.name))
      queryParams.append('functions', JSON.stringify(func));
  });

  const functionChannels = new Set(
    functionsState.functionsWithDeps
      .filter((func) => projection?.includes(func.name))
      .flatMap((func) => func.channels)
  );

  // Ensure `functionChannels` does not contain channels already in `projection`
  const uniqueFunctionChannels = Array.from(functionChannels).filter(
    (channel) => !projection?.includes(channel)
  );

  uniqueFunctionChannels.forEach((channel) => {
    existsConditions.push({ [`channels.${channel}`]: { $exists: true } });
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

  return ogApi
    .get(`/records`, {
      params: queryParams,
    })
    .then((response) => {
      const records: Record[] = response.data;
      return records;
    });
};

const fetchRecordCountQuery = async (
  searchParams: SearchParams,
  filters: string[],
  functionsState: APIFunctionState,
  projection?: string[]
): Promise<number> => {
  const queryParams = new URLSearchParams();

  const { dateRange, dataTypes } = searchParams;

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
  if (dataTypes) searchObj.push({ 'metadata.active_area': { $in: dataTypes } });

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

      if (channel !== timeChannelName) {
        existsConditions.push({ [key]: { $exists: true } });
      }
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

  return ogApi
    .get(`/records/count`, {
      params: queryParams,
    })
    .then((response) => response.data);
};

export const fetchRangeRecordConverterQuery = async (
  fromDate: string | undefined,
  toDate: string | undefined,
  shotnumMin: ShotNumType | undefined,
  shotnumMax: ShotNumType | undefined,
  dataType?: string
): Promise<DateRangetoShotnumConverter> => {
  const queryParams = new URLSearchParams();
  let timestampObj: { from?: string; to?: string; type?: string } = {};
  if (fromDate || toDate) {
    timestampObj = {
      from: fromDate,
      to: toDate,
    };
  }
  if (dataType) timestampObj.type = dataType;

  if (fromDate || toDate) {
    queryParams.append('date_range', JSON.stringify(timestampObj));
  }

  let shotnumObj: { min?: ShotNumType; max?: ShotNumType; type?: string } = {};
  if (shotnumMin || shotnumMax) {
    shotnumObj = {
      min: shotnumMin,
      max: shotnumMax,
    };
  }

  if (dataType) shotnumObj.type = dataType;

  if (shotnumMin || shotnumMax) {
    queryParams.append('shotnum_range', JSON.stringify(shotnumObj));
  }

  return ogApi
    .get(`/records/range_converter`, {
      params: queryParams,
    })
    .then((response) => {
      let inputRange;
      if (fromDate || toDate) {
        inputRange = { from: fromDate, to: toDate };
      }
      if (shotnumMin || shotnumMax) {
        inputRange = { min: shotnumMin, max: shotnumMax };
      }
      return { ...inputRange, ...response.data };
    });
};

export const useDateToShotnumConverter = (
  fromDate: string | undefined,
  toDate: string | undefined,
  dataType?: string,
  enabled?: boolean
): UseQueryResult<DateRangetoShotnumConverter, AxiosError> => {
  return useQuery({
    queryKey: ['dateToShotnumConverter', { fromDate, toDate, dataType }],

    queryFn: () => {
      return fetchRangeRecordConverterQuery(
        fromDate,
        toDate,
        undefined,
        undefined,
        dataType
      );
    },
    meta: {
      silentError: true,
    },
    enabled,
  });
};

export const useShotnumToDateConverter = (
  shotnumMin: ShotNumType | undefined,
  shotnumMax: ShotNumType | undefined,
  dataType?: string,
  enabled?: boolean
): UseQueryResult<DateRangetoShotnumConverter, AxiosError> => {
  return useQuery({
    queryKey: ['shotnumToDateConverter', { shotnumMin, shotnumMax, dataType }],
    queryFn: () =>
      fetchRangeRecordConverterQuery(
        undefined,
        undefined,
        shotnumMin,
        shotnumMax,
        dataType
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
          active_area: record.metadata.active_area,
          active_experiment: record.metadata.active_experiment,
          channelMetadata: {},
        };

        const keys = Object.keys(record.channels ?? {});
        keys.forEach((key: string) => {
          const channel = record.channels?.[key];

          if (channel) {
            let channelData;

            if (isChannelScalar(channel)) {
              channelData = channel.data;
            } else if (
              isChannelImage(channel) ||
              isChannelWaveform(channel) ||
              isChannelFloatImage(channel) ||
              isChannelVector(channel)
            ) {
              channelData = channel.thumbnail;
            }

            recordRow[key] = channelData;
            recordRow.channelMetadata[key] = channel.metadata;
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
      formattedData = convertApiTimestampToDate(
        record.metadata.timestamp
      ).getTime();
      break;
    case 'shotnum':
      formattedData =
        typeof record.metadata.shotnum === 'number'
          ? record.metadata.shotnum
          : NaN;
      break;
    case 'active_area':
      formattedData = record.metadata.active_area
        ? parseInt(record.metadata.active_area)
        : NaN;
      break;
    case 'active_experiment':
      formattedData = record.metadata.active_experiment
        ? parseInt(record.metadata.active_experiment)
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
        searchParams,
        filters,
        functions,
        projection
      );
    },
  });
};
