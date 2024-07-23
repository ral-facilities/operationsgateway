import { renderHook, waitFor } from '@testing-library/react';
import {
  getInitialState,
  hooksWrapperWithProviders,
  waitForRequest,
} from '../setupTests';
import { RootState } from '../state/store';
import { useWaveform } from './waveforms';

describe('waveform api functions', () => {
  let params: URLSearchParams;
  let state: RootState;

  beforeEach(() => {
    params = new URLSearchParams();
    state = getInitialState();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useWaveform', () => {
    it('sends request to fetch function waveform and returns successful response', async () => {
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
              dataType: 'waveform',
              channels: ['CHANNEL_EFGHI'],
            },
          ],
        },
      };
      const pendingRequest = waitForRequest('GET', '/waveforms/1/TEST');
      const { result } = renderHook(() => useWaveform('1', 'TEST'), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const request = await pendingRequest;

      params.append(
        'functions',
        JSON.stringify({ name: 'b', expression: 'CHANNEL_EFGHI' })
      );

      expect(result.current.data).toEqual({
        _id: '1',
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [2, 10, 8, 7, 1, 4, 5, 3, 6, 9],
      });

      expect(request.url.searchParams.toString()).toEqual(params.toString());
    });

    it('sends request to fetch waveform and returns successful response', async () => {
      const { result } = renderHook(() => useWaveform('1', 'TEST'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual({
        _id: '1',
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [2, 10, 8, 7, 1, 4, 5, 3, 6, 9],
      });
    });

    it.todo(
      'sends axios request to fetch waveform and throws an appropriate error on failure'
    );
  });
});
