import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { hooksWrapperWithProviders, waitForRequest } from '../setupTests';
import { useColourBar, useColourMaps, useImage } from './images';

describe('images api functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useImage', () => {
    let params: URLSearchParams;

    beforeEach(() => {
      params = new URLSearchParams();
    });

    it('sends request to fetch original image and returns successful response', async () => {
      const pendingRequest = waitForRequest('GET', '/images/1/TEST');

      const { result } = renderHook(() => useImage('1', 'TEST'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const request = await pendingRequest;

      params.set('original_image', 'true');

      expect(result.current.data).toEqual('testObjectUrl');
      expect(request.url.searchParams).toEqual(params);
    });

    it('sends request to fetch original image with empty false colour params and returns successful response', async () => {
      const pendingRequest = waitForRequest('GET', '/images/1/TEST');

      const { result } = renderHook(() => useImage('1', 'TEST', {}), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const request = await pendingRequest;

      params.set('original_image', 'true');

      expect(result.current.data).toEqual('testObjectUrl');
      expect(request.url.searchParams).toEqual(params);
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

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const request = await pendingRequest;

      params.set('colourmap_name', 'red');
      params.set('lower_level', '5');
      params.set('upper_level', '200');

      expect(result.current.data).toEqual('testObjectUrl');
      expect(request.url.searchParams).toEqual(params);
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
      expect(request.url.searchParams).toEqual(params);
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

      expect(result.current.data).toEqual({
        extended: [
          'colourmap_5',
          'colourmap_5_r',
          'colourmap_6',
          'colourmap_6_r',
          'colourmap_7',
          'colourmap_7_r',
          'colourmap_8',
          'colourmap_8_r',
          'colourmap_9',
          'colourmap_9_r',
          'colourmap_10',
          'colourmap_11',
          'colourmap_12',
        ],
        main: [
          'colourmap_1',
          'colourmap_1_r',
          'colourmap_2',
          'colourmap_2_r',
          'colourmap_3',
          'colourmap_3_r',
          'colourmap_4',
          'colourmap_4_r',
        ],
      });
    });

    it.todo(
      'sends axios request to fetch colourmaps and throws an appropriate error on failure'
    );
  });
});
