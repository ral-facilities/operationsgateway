import { Record, RecordRow, ScalarChannel } from '../app.types';
import {
  testRecords,
  testRecordRows,
  hooksWrapperWithProviders,
  getInitialState,
  generateRecord,
} from '../setupTests';
import axios from 'axios';
import { renderHook, waitFor } from '@testing-library/react';
import {
  getFormattedAxisData,
  usePlotRecords,
  useRecordCount,
  useRecords,
  useRecordsPaginated,
} from './records';
import { PreloadedState } from '@reduxjs/toolkit';
import { RootState } from '../state/store';
import { parseISO } from 'date-fns';

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

  describe('useRecords', () => {
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

      const { result } = renderHook(() => useRecords(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(axios.get).toHaveBeenCalledWith(
        '/records',
        expect.objectContaining({ params })
      );
      expect(result.current.data).toEqual(testRecords);
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

      const { result } = renderHook(() => useRecords(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(axios.get).toHaveBeenCalledWith(
        '/records',
        expect.objectContaining({ params })
      );
      expect(result.current.data).toEqual(testRecords);
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

    it.todo(
      'sends axios request to fetch record count and throws an appropriate error on failure'
    );
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

    it('uses a select function to format the results', async () => {
      const { result } = renderHook(() => useRecordsPaginated(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(
        dataResponsesEqual(result.current.data, testRecordRows)
      ).toBeTruthy();
    });
  });

  describe('usePlotRecords', () => {
    beforeEach(() => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('uses a select function to format the results', async () => {
      mockData[1].metadata.activeExperiment = undefined;
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      const { result } = renderHook(
        () => usePlotRecords('activeArea', ['activeExperiment']),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const expectedData = [
        {
          name: 'activeExperiment',
          data: mockData
            .filter((record: Record) => {
              return Boolean(record.metadata.activeExperiment);
            })
            .map((record: Record) => {
              return {
                activeArea: parseInt(record.metadata.activeArea),
                activeExperiment: parseInt(record.metadata.activeExperiment),
              };
            }),
        },
      ];

      expect(result.current.data).toEqual(expectedData);
    });
  });

  describe('getFormattedAxisData function', () => {
    let testRecord: Record;

    beforeEach(() => {
      // record with num = 3 creates a record with a scalar channel called test_3
      // this corresponds with scalar metadata channel test_3 in testChannels variable
      testRecord = generateRecord(3);
    });

    it('formats timestamp correctly', () => {
      const unixTimestamp = parseISO(testRecord.metadata.timestamp).getTime();
      const result = getFormattedAxisData(testRecord, 'timestamp');
      expect(result).toEqual(unixTimestamp);
    });

    it('formats shot number correctly', () => {
      let result = getFormattedAxisData(testRecord, 'activeExperiment');
      expect(result).toEqual(testRecord.metadata.shotnum);

      testRecord.metadata.shotnum = undefined;
      result = getFormattedAxisData(testRecord, 'shotnum');
      expect(result).toEqual(NaN);
    });

    it('formats activeArea correctly', () => {
      const result = getFormattedAxisData(testRecord, 'activeArea');
      expect(result).toEqual(parseInt(testRecord.metadata.activeArea));
    });

    it('formats activeExperiment correctly', () => {
      testRecord.metadata.activeExperiment = '4';
      let result = getFormattedAxisData(testRecord, 'activeExperiment');
      expect(result).toEqual(parseInt(testRecord.metadata.activeExperiment));

      testRecord.metadata.activeExperiment = undefined;
      result = getFormattedAxisData(testRecord, 'activeExperiment');
      expect(result).toEqual(NaN);
    });

    it('formats channel data correctly', () => {
      let result = getFormattedAxisData(testRecord, 'test_3');
      expect(result).toEqual(
        (testRecord.channels['test_3'] as ScalarChannel).data
      );

      (testRecord.channels['test_3'] as ScalarChannel).data = '1';
      result = getFormattedAxisData(testRecord, 'test_3');
      expect(result).toEqual(1);

      result = getFormattedAxisData(testRecord, 'invalid_channel');
      expect(result).toEqual(NaN);
    });
  });
});
