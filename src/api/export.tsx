import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { SearchParams, SortType, type APIFunctionState } from '../app.types';
import handleOG_APIError from '../handleOG_APIError';
import { useAppSelector } from '../state/hooks';
import { selectQueryParams } from '../state/slices/searchSlice';
import { selectSelectedRows } from '../state/slices/selectionSlice';
import { selectSelectedIdsIgnoreOrder } from '../state/slices/tableSlice';
import { formatAPIQueryParams, ogApi } from './api';

export interface DataToExport {
  Scalars?: boolean;
  Strings?: boolean;
  Images?: boolean;
  'Float Images'?: boolean;
  'Waveform CSVs'?: boolean;
  'Waveform Images'?: boolean;
  'Vector CSVs'?: boolean;
  'Vector Images'?: boolean;
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
  selectedRows?: string[],
  selectedColumn?: string
): Promise<void> => {
  let skip: string | undefined = undefined;
  let limit: string | undefined = undefined;
  if (!(offsetParams?.stopIndex === Infinity)) {
    skip = offsetParams ? JSON.stringify(offsetParams.startIndex) : '0';
    limit = offsetParams
      ? JSON.stringify(offsetParams.stopIndex - offsetParams.startIndex)
      : '0';
  }
  const queryParams = formatAPIQueryParams({
    sort,
    searchParams,
    filters,
    functionsState,
    skip,
    limit,
    projection: selectedColumn ? [selectedColumn] : projection,
    selectedRows,
  });

  if (dataToExport) {
    queryParams.append(
      'export_scalars',
      JSON.stringify(dataToExport['Scalars'] ?? false)
    );
    queryParams.append(
      'export_strings',
      JSON.stringify(dataToExport['Strings'] ?? false)
    );
    queryParams.append(
      'export_images',
      JSON.stringify(dataToExport['Images'] ?? false)
    );
    queryParams.append(
      'export_float_images',
      JSON.stringify(dataToExport['Float Images'] ?? false)
    );
    queryParams.append(
      'export_waveform_csvs',
      JSON.stringify(dataToExport['Waveform CSVs'] ?? false)
    );
    queryParams.append(
      'export_waveform_images',
      JSON.stringify(dataToExport['Waveform Images'] ?? false)
    );
    queryParams.append(
      'export_vector_csvs',
      JSON.stringify(dataToExport['Vector CSVs'] ?? false)
    );
    queryParams.append(
      'export_vector_images',
      JSON.stringify(dataToExport['Vector Images'] ?? false)
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

export const useExportData = (): UseMutationResult<
  void,
  AxiosError,
  {
    exportType: string;
    dataToExport: DataToExport;
    selectedColumn?: string;
  }
> => {
  const selectedRows = useAppSelector(selectSelectedRows);
  const { searchParams, page, resultsPerPage, sort, filters, functions } =
    useAppSelector(selectQueryParams);
  const projection = useAppSelector(selectSelectedIdsIgnoreOrder);

  const { maxShots } = searchParams;

  return useMutation({
    mutationKey: ['exportData'],

    mutationFn: (params: {
      exportType: string;
      dataToExport: DataToExport;
      selectedColumn?: string;
    }) => {
      const { exportType, dataToExport, selectedColumn } = params;
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
        exportType === 'Selected Rows' ? selectedRows : undefined,
        selectedColumn
      );
    },
    onError: (error) => {
      handleOG_APIError(error);
    },
  });
};
