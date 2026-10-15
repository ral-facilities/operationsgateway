import { tz } from '@date-fns/tz';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import {
  APIFunctionState,
  MicroFrontendId,
  SearchParams,
  SortType,
  timeChannelName,
  type APIError,
} from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { settings } from '../settings';
import { InvalidateTokenType } from '../state/scigateway.actions';
import { staticChannels } from './channels';

// These are for ensuring refresh request is only sent once when multiple requests
// are failing due to 403's at the same time
let isFetchingAccessToken = false;
let failedAuthRequestQueue: ((shouldReject?: boolean) => void)[] = [];

/* This should be called when SciGateway successfully refreshes the access token - it retries
   all requests that failed due to an invalid token */
export const retryFailedAuthRequests = () => {
  isFetchingAccessToken = false;
  failedAuthRequestQueue.forEach((callback) => callback());
  failedAuthRequestQueue = [];
};

/* This should be called when SciGateway logs out as would occur if a token refresh fails
   due to the refresh token being out of date - it rejects all active request promises that
   were awaiting a token refresh using the original error that occurred on the first attempt */
export const clearFailedAuthRequestsQueue = () => {
  isFetchingAccessToken = false;
  failedAuthRequestQueue.forEach((callback) => callback(true));
  failedAuthRequestQueue = [];
};

export const ogApi = axios.create();

ogApi.interceptors.request.use(async (config) => {
  const settingsData = await settings;
  config.baseURL = settingsData ? settingsData.apiUrl : '';
  config.headers['Authorization'] = `Bearer ${readSciGatewayToken()}`;
  return config;
});

ogApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    const errorDetail = (error.response.data as APIError)?.detail;

    const errorMessage =
      typeof errorDetail === 'string'
        ? errorDetail.toLocaleLowerCase()
        : error.message;

    // Check if the token is invalid and needs refreshing
    // only allow a request to be retried once. Don't retry if not logged
    // in, it should not have been accessible
    if (
      error.response?.status === 403 &&
      errorMessage.includes('invalid token') &&
      !originalRequest._retried &&
      localStorage.getItem('scigateway:token')
    ) {
      originalRequest._retried = true;

      // Prevent other requests from also attempting to refresh while waiting for
      // SciGateway to refresh the token
      if (!isFetchingAccessToken) {
        isFetchingAccessToken = true;

        // Request SciGateway to refresh the token
        document.dispatchEvent(
          new CustomEvent(MicroFrontendId, {
            detail: {
              type: InvalidateTokenType,
            },
          })
        );
      }

      // Add request to queue to be resolved only once SciGateway has successfully
      // refreshed the token
      return new Promise((resolve, reject) => {
        failedAuthRequestQueue.push((shouldReject?: boolean) => {
          if (shouldReject) reject(error);
          else resolve(ogApi(originalRequest));
        });
      });
    }
    // Any other error
    else return Promise.reject(error);
  }
);

export const formatDateTimeForApi = (datetime: Date): string => {
  return format(datetime, "yyyy-MM-dd'T'HH:mm:ss", { in: tz('UTC') });
};

export const convertApiTimestampToDate = (apiTimestamp: string): Date =>
  parseISO(`${apiTimestamp}Z`);

export const formatAPIQueryParams = ({
  initialQueryParams,
  sort,
  searchParams,
  filters,
  functionsState,
  skip,
  limit,
  projection,
  selectedRows,
  isCountQuery,
}: {
  initialQueryParams?: URLSearchParams;
  sort?: SortType;
  searchParams: SearchParams;
  filters: string[];
  functionsState: APIFunctionState;
  skip?: string;
  limit?: string;
  projection?: string[];
  selectedRows?: string[];
  isCountQuery?: boolean;
}) => {
  const queryParams = initialQueryParams ?? new URLSearchParams();

  if (sort) {
    for (const [key, value] of Object.entries(sort)) {
      // API recognises sort values as metadata.key or channel.key
      // Therefore, we must construct the appropriate parameter
      const sortKey =
        key in staticChannels ? `metadata.${key}` : `channels.${key}`;
      queryParams.append('order', `${sortKey} ${value}`);
    }
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
    // API recognises projection values as metadata.key or channel.key
    // Therefore, we must construct the appropriate parameter
    const key =
      channel in staticChannels ? `metadata.${channel}` : `channels.${channel}`;
    if (!isCountQuery) queryParams.append('projection', key);

    let is_function = false;
    functionsState.functions.forEach((func) => {
      if (channel === func.name) is_function = true;
    });

    // Do not add exist conditions for functions
    if (channel !== timeChannelName && !is_function) {
      existsConditions.push({ [key]: { $exists: true } });
    }
  });

  if (!isCountQuery) {
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
  }

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

  if (skip) queryParams.append('skip', skip);
  if (limit) queryParams.append('limit', limit);

  return queryParams;
};
