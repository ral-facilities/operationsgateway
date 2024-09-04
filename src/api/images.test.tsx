import { renderHook, waitFor } from '@testing-library/react';
import colourMapsJson from '../mocks/colourMaps.json';

import { RootState } from '../state/store';
import {
  getInitialState,
  hooksWrapperWithProviders,
  waitForRequest,
} from '../testUtils';
import { useColourBar, useColourMaps, useImage } from './images';

describe('images api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useImage', () => {
    let params: URLSearchParams;

    let state: RootState;

    beforeEach(() => {
      params = new URLSearchParams();
      state = getInitialState();
    });

    it('sends request to fetch original image and returns successful response', async () => {
      const pendingRequest = waitForRequest('GET', '/images/1/TEST');

      const { result } = renderHook(() => useImage('1', 'TEST'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBeTruthy();
        },
        { timeout: 5000 }
      );

      const request = await pendingRequest;

      params.set('original_image', 'true');

      expect(result.current.data).toEqual('testObjectUrl');
      expect(new URL(request.url).searchParams).toEqual(params);
    });

    it('sends request to image from a function and returns successful response', async () => {
      state = {
        ...state,
        functions: {
          appliedFunctions: [
            {
              id: '1',
              name: 'b',
              expression: [
                {
                  type: 'channel',
                  label: 'CHANNEL_EFGHI',
                  value: 'CHANNEL_EFGHI',
                },
              ],
              dataType: 'image',
              channels: ['CHANNEL_EFGHI'],
            },
          ],
        },
      };
      const pendingRequest = waitForRequest('GET', '/images/1/TEST');

      const { result } = renderHook(() => useImage('1', 'TEST'), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBeTruthy();
        },
        { timeout: 5000 }
      );

      const request = await pendingRequest;

      params.set('original_image', 'true');
      params.append(
        'functions',
        JSON.stringify({ name: 'b', expression: 'CHANNEL_EFGHI' })
      );

      expect(result.current.data).toEqual('testObjectUrl');
      expect(new URL(request.url).searchParams.toString()).toEqual(
        params.toString()
      );
    });

    it('sends request to fetch original image with empty false colour params and returns successful response', async () => {
      const pendingRequest = waitForRequest('GET', '/images/1/TEST');

      const { result } = renderHook(() => useImage('1', 'TEST', {}), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBeTruthy();
        },
        { timeout: 5000 }
      );

      const request = await pendingRequest;

      params.set('original_image', 'true');

      expect(result.current.data).toEqual('testObjectUrl');
      expect(new URL(request.url).searchParams).toEqual(params);
    });

    it('sends request to fetch false colour image and returns successful response', async () => {
      const pendingRequest = waitForRequest('GET', '/images/1/TEST');

      const { result } = renderHook(
        () =>
          useImage('1', 'TEST', {
            colourMap: 'red',
            lowerLevel: 5,
            upperLevel: 200,
          }),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBeTruthy();
        },
        { timeout: 5000 }
      );

      const request = await pendingRequest;

      params.set('colourmap_name', 'red');
      params.set('lower_level', '5');
      params.set('upper_level', '200');

      expect(result.current.data).toEqual('testObjectUrl');
      expect(new URL(request.url).searchParams).toEqual(params);
    });

    it.todo(
      'sends axios request to fetch image and throws an appropriate error on failure'
    );
  });

  describe('useColourBar', () => {
    let params: URLSearchParams;

    beforeEach(() => {
      params = new URLSearchParams();
    });

    it('sends request to fetch colourbar and returns successful response', async () => {
      const pendingRequest = waitForRequest('GET', '/images/colour_bar');

      const { result } = renderHook(
        () =>
          useColourBar({
            colourMap: 'red',
            lowerLevel: 5,
            upperLevel: 200,
          }),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const request = await pendingRequest;

      params.set('colourmap_name', 'red');
      params.set('lower_level', '5');
      params.set('upper_level', '200');

      expect(result.current.data).toEqual('testObjectUrl');
      expect(new URL(request.url).searchParams).toEqual(params);
    });

    it.todo(
      'sends axios request to fetch colourbar and throws an appropriate error on failure'
    );
  });

  describe('useColourMaps', () => {
    it('sends request to fetch colourmaps and returns successful response', async () => {
      const { result } = renderHook(() => useColourMaps(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(colourMapsJson);
    });

    it.todo(
      'sends axios request to fetch colourmaps and throws an appropriate error on failure'
    );
  });
});
