import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { hooksWrapperWithProviders } from '../setupTests';
import { useWaveform } from './waveforms';

describe('channels api functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useChannels', () => {
    it('sends request to fetch channels and returns successful response', async () => {
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
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });
});
