import axios from 'axios';
import { MicroFrontendId, type APIError } from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { settings } from '../settings';
import { InvalidateTokenType } from '../state/scigateway.actions';

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
  // const settingsData = await settings;
  // config.baseURL = settingsData ? settingsData.apiUrl : '';
  config.headers['Authorization'] = `Bearer ${readSciGatewayToken()}`;
  return config;
});

ogApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    const errorMessage: string = error.response?.data
      ? Array.isArray((error.response.data as APIError).detail)
        ? ''
        : ((
            (error.response.data as APIError).detail as string
          )?.toLocaleLowerCase() ?? error.message)
      : error.message;

    // Check if the token is invalid and needs refreshing
    // only allow a request to be retried once. Don't retry if not logged
    // in, it should not have been accessible
    if (
      error.response?.status === 403 &&
      errorMessage.includes('expired token') &&
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
