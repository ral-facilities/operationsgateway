import {
  UseQueryResult,
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { APIFunctionState } from '../app.types';
import { useAppSelector } from '../state/hooks';
import { selectQueryParams } from '../state/slices/searchSlice';
import { ogApi } from './api';

export interface FalseColourParams {
  colourMap?: string;
  lowerLevel?: number;
  upperLevel?: number;
}

export interface ColourMapsParams {
  [category: string]: string[] | undefined;
}

export const fetchImage = async (
  recordId: string,
  channelName: string,
  functionsState: APIFunctionState,
  falseColourParams?: FalseColourParams
): Promise<string> => {
  const params = new URLSearchParams();

  if (falseColourParams) {
    const { colourMap, lowerLevel, upperLevel } = falseColourParams;

    if (typeof colourMap !== 'undefined')
      params.set('colourmap_name', colourMap);
    if (typeof lowerLevel !== 'undefined')
      params.set('lower_level', lowerLevel.toString());
    if (typeof upperLevel !== 'undefined')
      params.set('upper_level', upperLevel.toString());
  }

  if (!falseColourParams || params.toString().length === 0)
    params.set('original_image', 'true');

  functionsState.functions.forEach((func) => {
    params.append('functions', JSON.stringify(func));
  });

  return ogApi
    .get(`/images/${recordId}/${channelName}`, {
      params,
      responseType: 'blob',
    })
    .then((response) => {
      return URL.createObjectURL(response.data);
    });
};

export const fetchColourBar = async (
  falseColourParams: FalseColourParams
): Promise<string> => {
  const params = new URLSearchParams();
  const { colourMap, lowerLevel, upperLevel } = falseColourParams;

  if (colourMap) params.set('colourmap_name', colourMap);
  if (lowerLevel) params.set('lower_level', lowerLevel.toString());
  if (upperLevel) params.set('upper_level', upperLevel.toString());

  return ogApi
    .get(`/images/colour_bar`, {
      params,
      responseType: 'blob',
    })
    .then((response) => {
      return URL.createObjectURL(response.data);
    });
};

export const fetchColourMaps = async (): Promise<ColourMapsParams> => {
  return ogApi.get(`/images/colourmap_names`).then((response) => {
    return response.data;
  });
};

export const useImage = (
  recordId: string,
  channelName: string,
  falseColourParams?: FalseColourParams
): UseQueryResult<string, AxiosError> => {
  const { functions } = useAppSelector(selectQueryParams);
  return useQuery({
    queryKey: ['images', recordId, channelName, functions, falseColourParams],
    queryFn: () => {
      return fetchImage(recordId, channelName, functions, falseColourParams);
    },
    // set to display old image whilst new one is loading
    placeholderData: keepPreviousData,
  });
};

export const useColourBar = (
  falseColourParams: FalseColourParams
): UseQueryResult<string, AxiosError> => {
  return useQuery({
    queryKey: ['colourbar', falseColourParams],
    queryFn: () => {
      return fetchColourBar(falseColourParams);
    },
    // set to display old colour bar whilst new one is loading
    placeholderData: keepPreviousData,
  });
};

export const useColourMaps = (): UseQueryResult<
  ColourMapsParams,
  AxiosError
> => {
  return useQuery({
    queryKey: ['colourmaps'],
    queryFn: () => {
      return fetchColourMaps();
    },
  });
};
