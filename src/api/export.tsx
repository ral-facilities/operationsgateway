import axios, { AxiosError } from 'axios';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useAppSelector } from '../state/hooks';
import { selectUrls } from '../state/slices/configSlice';
import { selectSelectedRows } from '../state/slices/selectionSlice';
import { selectQueryParams } from '../state/slices/searchSlice';
import { selectSelectedIdsIgnoreOrder } from '../state/slices/tableSlice';
import { readSciGatewayToken } from '../parseTokens';
import { SearchParams, SortType, timeChannelName } from '../app.types';
import { staticChannels } from './channels';

interface DataToExport {
  Scalars: boolean;
  Images: boolean;
  'Waveform CSVs': boolean;
  'Waveform Images': boolean;
}

export const exportData = (
  apiUrl: string,
  sort: SortType,
  searchParams: SearchParams,
  filters: string[],
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
    // API recognises projection values as metadata.key or channel.key
    // Therefore, we must construct the appropriate parameter
    const key =
      channel in staticChannels ? `metadata.${channel}` : `channels.${channel}`;
    queryParams.append('projection', key);

    if (channel !== timeChannelName) {
      existsConditions.push({ [key]: { $exists: true } });
    }
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

  return axios
    .get(`${apiUrl}/export`, {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
      responseType: 'blob',
    })
    .then((response) => {
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
    });
};

export const useExportData = (): UseMutationResult<void, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);
  const selectedRows = useAppSelector(selectSelectedRows);
  const { searchParams, page, resultsPerPage, sort, filters } =
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
        apiUrl,
        sort,
        searchParams,
        filters,
        { startIndex, stopIndex },
        projection,
        dataToExport,
        exportType === 'Selected Rows' ? selectedRows : undefined
      );
    },
  });
};
