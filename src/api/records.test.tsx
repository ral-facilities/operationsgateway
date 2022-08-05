import { Record, RecordRow } from '../app.types';
import {
  testRecords,
  testRecordRows,
  renderWithProvidersForHook,
} from '../setupTests';
import axios from 'axios';
import { renderHook, waitFor } from '@testing-library/react';
import { useRecordCount, useRecordsPaginated } from './records';

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

  beforeEach(() => {
    mockData = testRecords;
    params = new URLSearchParams();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useRecordsPaginated', () => {
    it('sends axios request to fetch records and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });
      // params.append('limit', '25');
      // params.append('skip', '0');

      const { result } = renderHook(() => useRecordsPaginated(), {
        wrapper: renderWithProvidersForHook(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(
        dataResponsesEqual(result.current.data, testRecordRows)
      ).toBeTruthy();
    });

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });

  describe('useRecordCount', () => {
    it('sends axios request to fetch record count and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData.length,
      });

      const { result } = renderHook(() => useRecordCount(), {
        wrapper: renderWithProvidersForHook(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(mockData.length);
    });

    it.todo(
      'sends axios request to fetch record count and throws an appropriate error on failure'
    );
  });
});
