import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  SearchParams,
  SortType,
  timeChannelName,
  type APIFunctionState,
} from '../app.types';
import handleOG_APIError from '../handleOG_APIError';
import { useAppSelector } from '../state/hooks';
import { selectQueryParams } from '../state/slices/searchSlice';
import { selectSelectedRows } from '../state/slices/selectionSlice';
import { selectSelectedIdsIgnoreOrder } from '../state/slices/tableSlice';
import { ogApi } from './api';
import { staticChannels } from './channels';

export interface DataToExport {
  Scalars: boolean;
  Images: boolean;
  'Float Image': boolean;
  'Waveform CSVs': boolean;
  'Waveform Images': boolean;
}

export const exportData = async (
  sort: SortType,
  searchParams: SearchParams,
  filters: string[],
  functionsState: APIFunctionState,
  offsetParams?: {
    startIndex: number;
    stopIndex: number;
  },
  projection?: string[],
  dataToExport?: DataToExport,
  selectedRows?: string[]
): Promise<void> => {
  const queryParams = new URLSearchParams();

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

    // API recognises projection values as metadata.key or channel.key
    // Therefore, we must construct the appropriate parameter
    const key =
      channel in staticChannels ? `metadata.${channel}` : `channels.${channel}`;
    queryParams.append('projection', key);

    if (channel !== timeChannelName && !is_function) {
      existsConditions.push({ [key]: { $exists: true } });
    }
  });

  functionsState.functions.forEach((func) => {
    queryParams.append('functions', JSON.stringify(func));
  });

  const functionChannels = new Set(
    functionsState.functionsWithChannels
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

  if (selectedRows) {
    searchObj.push({ _id: { $in: selectedRows } });
  }

  if (existsConditions.length > 0 || searchObj.length > 0) {
    const query =
      existsConditions.length > 0 && searchObj.length > 0
        ? { $and: searchObj, $or: existsConditions }
        : existsConditions.length > 0
          ? { $or: existsConditions }
          : { $and: searchObj };

    queryParams.append('conditions', JSON.stringify(query));
  }

  if (dataToExport) {
    queryParams.append(
      'export_scalars',
      JSON.stringify(dataToExport['Scalars'])
    );
    queryParams.append('export_images', JSON.stringify(dataToExport['Images']));
    queryParams.append(
      'export_float_images',
      JSON.stringify(dataToExport['Float Image'])
    );
    queryParams.append(
      'export_waveform_csvs',
      JSON.stringify(dataToExport['Waveform CSVs'])
    );
    queryParams.append(
      'export_waveform_images',
      JSON.stringify(dataToExport['Waveform Images'])
    );
  }

  if (!(offsetParams?.stopIndex === Infinity)) {
    queryParams.append(
      'skip',
      offsetParams ? JSON.stringify(offsetParams.startIndex) : '0'
    );
    queryParams.append(
      'limit',
      offsetParams
        ? JSON.stringify(offsetParams.stopIndex - offsetParams.startIndex)
        : '0'
    );
  }

  const response = await ogApi.get(`/export`, {
    params: queryParams,
    responseType: 'blob',
  });
  const href = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = href;
  link.download = response.headers['content-disposition']
    .split('filename=')[1]
    .slice(1, -1);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
};

export const useExportData = (): UseMutationResult<void, AxiosError> => {
  const selectedRows = useAppSelector(selectSelectedRows);
  const { searchParams, page, resultsPerPage, sort, filters, functions } =
    useAppSelector(selectQueryParams);
  const projection = useAppSelector(selectSelectedIdsIgnoreOrder);

  const { maxShots } = searchParams;

  return useMutation({
    mutationKey: ['exportData'],

    mutationFn: (params) => {
      const { exportType, dataToExport } = params as {
        exportType: string;
        dataToExport: DataToExport;
      };
      const startIndex =
        exportType === 'Visible Rows' ? page * resultsPerPage : 0;
      const stopIndex =
        exportType === 'Visible Rows'
          ? startIndex + resultsPerPage
          : exportType === 'All Rows'
            ? maxShots
            : 0;

      return exportData(
        sort,
        searchParams,
        filters,
        functions,
        { startIndex, stopIndex },
        projection,
        dataToExport,
        exportType === 'Selected Rows' ? selectedRows : undefined
      );
    },
    onError: (error) => {
      handleOG_APIError(error);
    },
  });
};
