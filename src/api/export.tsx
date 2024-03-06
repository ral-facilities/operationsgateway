import axios, { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAppSelector } from '../state/hooks';
import { selectUrls } from '../state/slices/configSlice';
import { selectSelectedRows } from '../state/slices/selectionSlice';
import { readSciGatewayToken } from '../parseTokens';

const exportData = (
  apiUrl: string,
  selectedRows: string[]
): Promise<string> => {
  return axios
    .post(`${apiUrl}/export`, selectedRows, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useExportData = (): UseQueryResult<void, AxiosError> => {
  const selectedRows = useAppSelector(selectSelectedRows);
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery({
    queryKey: ['exportData'],

    queryFn: (params) => {
      return exportData(apiUrl, selectedRows);
    },
  });
};
