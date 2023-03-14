import { UseQueryResult, useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { readSciGatewayToken } from '../parseTokens';
import { useAppSelector } from '../state/hooks';
import { selectUrls } from '../state/slices/configSlice';

export interface FalseColourParams {
  colourMap?: string;
  lowerLevel?: number;
  upperLevel?: number;
}

export const fetchImage = async (
  apiUrl: string,
  recordId: string,
  channelName: string,
  falseColourParams?: FalseColourParams
): Promise<string> => {
  const params = new URLSearchParams();

  if (falseColourParams) {
    const { colourMap, lowerLevel, upperLevel } = falseColourParams;

    if (colourMap) params.set('colourmap_name', colourMap);
    if (lowerLevel) params.set('lower_level', lowerLevel.toString());
    if (upperLevel) params.set('upper_level', upperLevel.toString());
  }

  return axios
    .get(`${apiUrl}/images/${recordId}/${channelName}`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
      responseType: 'blob',
    })
    .then((response) => {
      return URL.createObjectURL(response.data);
    });
};

export const fetchColourBar = async (
  apiUrl: string,
  falseColourParams: FalseColourParams
): Promise<string> => {
  const params = new URLSearchParams();
  const { colourMap, lowerLevel, upperLevel } = falseColourParams;

  if (colourMap) params.set('colourmap_name', colourMap);
  if (lowerLevel) params.set('lower_level', lowerLevel.toString());
  if (upperLevel) params.set('upper_level', upperLevel.toString());

  return axios
    .get(`${apiUrl}/images/colour_bar`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
      responseType: 'blob',
    })
    .then((response) => {
      return URL.createObjectURL(response.data);
    });
};

export const fetchColourMaps = async (apiUrl: string): Promise<string[]> => {
  return axios
    .get(`${apiUrl}/images/colourmap_names`, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken()}`,
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const useImage = (
  recordId: string,
  channelName: string,
  falseColourParams?: FalseColourParams
): UseQueryResult<string, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery<
    string,
    AxiosError,
    string,
    [string, string, string, FalseColourParams?]
  >(
    ['images', recordId, channelName, falseColourParams],
    (params) => {
      return fetchImage(apiUrl, recordId, channelName, falseColourParams);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      // set to display old image whilst new one is loading
      keepPreviousData: true,
    }
  );
};

export const useColourBar = (
  falseColourParams: FalseColourParams
): UseQueryResult<string, AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery<string, AxiosError, string, [string, FalseColourParams]>(
    ['colourbar', falseColourParams],
    (params) => {
      return fetchColourBar(apiUrl, falseColourParams);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      // set to display old colour bar whilst new one is loading
      keepPreviousData: true,
    }
  );
};

export const useColourMaps = (): UseQueryResult<string[], AxiosError> => {
  const { apiUrl } = useAppSelector(selectUrls);

  return useQuery<string[], AxiosError, string[], [string]>(
    ['colourmaps'],
    (params) => {
      return fetchColourMaps(apiUrl);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};
