import { Record, RecordRow } from '../app.types';
import {
  testRecords,
  testRecordRows,
  hooksWrapperWithProviders,
  getInitialState,
} from '../setupTests';
import axios from 'axios';
import { renderHook, waitFor } from '@testing-library/react';
import { useRecordCount, useRecordsPaginated } from './records';
import { PreloadedState } from '@reduxjs/toolkit';
import { RootState } from '../state/store';

const dataResponsesEqual = (x?: RecordRow[], y?: RecordRow[]): boolean => {
  if (!x || !y) return false;
  if (x.length !== y.length) return false;

  for (let i = 0; i < x.length; i++) {
    const xRow = x[i];
    const yRow = y[i];

    const xKeys = Object.keys(xRow);
    const yKeys = Object.keys(yRow);

    for (let i = 0; i < xKeys.length; i++) {
      if (xKeys[i] !== yKeys[i]) return false;
    }

    if (xRow.timestamp !== yRow.timestamp) return false;
    if (xRow.shotnum !== yRow.shotnum) return false;
    if (xRow.activeArea !== yRow.activeArea) return false;
    if (xRow.activeExperiment !== yRow.activeExperiment) return false;
  }

  return true;
};

describe('records api functions', () => {
  let mockData: Record[];
  let params: URLSearchParams;
  let state: PreloadedState<RootState>;

  beforeEach(() => {
    mockData = testRecords;
    params = new URLSearchParams();
    state = getInitialState();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useRecordsPaginated', () => {
    beforeEach(() => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('sends axios request to fetch records and returns successful response', async () => {
      params.append('limit', '25');
      params.append('skip', '0');

      const { result } = renderHook(() => useRecordsPaginated(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(axios.get).toHaveBeenCalledWith(
        '/records',
        expect.objectContaining({ params })
      );
      expect(
        dataResponsesEqual(result.current.data, testRecordRows)
      ).toBeTruthy();
    });

    it('can send sort and date range parameters as part of request', async () => {
      state = {
        ...getInitialState(),
        table: {
          ...getInitialState().table,
          sort: { timestamp: 'asc', CHANNEL_1: 'desc' },
        },
        search: {
          ...getInitialState().search,
          dateRange: {
            fromDate: '2022-01-01 00:00:00',
            toDate: '2022-01-02: 00:00:00',
          },
        },
      };

      params.append('limit', '25');
      params.append('skip', '0');
      params.append('order', 'timestamp asc');
      params.append('order', 'CHANNEL_1 desc');
      params.append(
        'conditions',
        "{$and:[{'metadata.timestamp':'$gt':'2022-01-01 00:00:00','$lt':'2022-01-02 00:00:00'}]"
      );

      const { result } = renderHook(() => useRecordsPaginated(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(axios.get).toHaveBeenCalledWith(
        '/records',
        expect.objectContaining({ params })
      );
      expect(
        dataResponsesEqual(result.current.data, testRecordRows)
      ).toBeTruthy();
    });

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });

  describe('useRecordCount', () => {
    beforeEach(() => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData.length,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('sends axios request to fetch record count and returns successful response', async () => {
      const { result } = renderHook(() => useRecordCount(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(axios.get).toHaveBeenCalledWith(
        '/records/count',
        expect.objectContaining({ params })
      );
      expect(result.current.data).toEqual(mockData.length);
    });

    it('can send date params as part of request', async () => {
      state = {
        ...getInitialState(),
        search: {
          ...getInitialState().search,
          dateRange: {
            fromDate: '2022-01-01 00:00:00',
            toDate: '2022-01-02: 00:00:00',
          },
        },
      };

      params.append(
        'conditions',
        "{$and:[{'metadata.timestamp':'$gt':'2022-01-01 00:00:00','$lt':'2022-01-02 00:00:00'}]"
      );

      const { result } = renderHook(() => useRecordCount(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(axios.get).toHaveBeenCalledWith(
        '/records/count',
        expect.objectContaining({ params })
      );
      expect(result.current.data).toEqual(mockData.length);
    });

    it.skip('sends axios request to fetch record count and throws an appropriate error on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });

      const { result } = renderHook(() => useRecordsPaginated(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBeTruthy();
      });

      expect(axios.get).toHaveBeenCalledWith(
        '/records/count',
        expect.objectContaining({ params })
      );

      // TODO expect further error assertions
    });
  });
});
