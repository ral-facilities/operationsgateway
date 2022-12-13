/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  PlotDataset,
  Record,
  RecordRow,
  ScalarChannel,
  SearchParams,
  SelectedPlotChannel,
} from '../app.types';
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
  useIncomingRecordCount,
  useRecordsPaginated,
} from './records';
import { PreloadedState } from '@reduxjs/toolkit';
import { RootState } from '../state/store';
import { parseISO } from 'date-fns';
import { operators, parseFilter, Token } from '../filtering/filterParser';
import { MAX_SHOTS_VALUES } from '../search/components/maxShots.component';

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
  let state: PreloadedState<RootState>;

  beforeEach(() => {
    state = getInitialState();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useRecordCount', () => {
    let mockData: Record[];
    let params: URLSearchParams;

    beforeEach(() => {
      params = new URLSearchParams();
      mockData = testRecords;
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData.length,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('sends axios request to fetch record count and returns successful response', async () => {
      const { result } = renderHook(() => useRecordCount(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(axios.get).toHaveBeenCalledWith('/records/count', {
        params,
        headers: { Authorization: 'Bearer null' },
      });
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );

      expect(result.current.data).toEqual(mockData.length);
    });

    it('can send date and filter params as part of request', async () => {
      state = {
        ...getInitialState(),
        search: {
          ...getInitialState().search,
          searchParams: {
            ...getInitialState().search.searchParams,
            dateRange: {
              fromDate: '2022-01-01 00:00:00',
              toDate: '2022-01-02 00:00:00',
            },
            maxShots: MAX_SHOTS_VALUES[0],
          },
        },
        filter: {
          ...getInitialState().filter,
          appliedFilters: [
            [
              { type: 'channel', value: 'shotnum', label: 'Shot Number' },
              operators.find((t) => t.value === '>')!,
              { type: 'number', value: '300', label: '300' },
            ],
          ],
        },
      };

      const { result } = renderHook(() => useRecordCount(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      params.append(
        'conditions',
        '{"$and":[{"metadata.timestamp":{"$gte":"2022-01-01 00:00:00","$lte":"2022-01-02 00:00:00"}},{"metadata.shotnum":{"$gt":300}}]}'
      );

      expect(axios.get).toHaveBeenCalledWith('/records/count', {
        params,
        headers: { Authorization: 'Bearer null' },
      });
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData.length);
    });

    it.todo(
      'sends axios request to fetch record count and throws an appropriate error on failure'
    );
  });

  describe('useIncomingRecordCount', () => {
    let mockData: Record[];
    let params: URLSearchParams;

    beforeEach(() => {
      params = new URLSearchParams();
      mockData = testRecords;
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData.length,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('sends axios request to fetch incoming record count and returns successful response', async () => {
      const { result } = renderHook(() => useIncomingRecordCount(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(axios.get).toHaveBeenCalledWith(
        '/records/count',
        expect.objectContaining({ params })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData.length);
    });

    it('can set filters and search params via function parameters', async () => {
      const testFilters: Token[][] = [
        [
          { type: 'channel', value: 'shotnum', label: 'Shot Number' },
          operators.find((t) => t.value === '>')!,
          { type: 'number', value: '300', label: '300' },
        ],
      ];
      const testFilterStrings = testFilters.map((f) => parseFilter(f));
      const testSearchParams: SearchParams = {
        dateRange: {
          fromDate: '2022-01-01 00:00:00',
          toDate: '2022-01-02 00:00:00',
        },
        shotnumRange: {},
        maxShots: MAX_SHOTS_VALUES[0],
      };

      const { result } = renderHook(
        () => useIncomingRecordCount(testFilterStrings, testSearchParams),
        {
          wrapper: hooksWrapperWithProviders(state),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      params.append(
        'conditions',
        '{"$and":[{"metadata.timestamp":{"$gte":"2022-01-01 00:00:00","$lte":"2022-01-02 00:00:00"}},{"metadata.shotnum":{"$gt":300}}]}'
      );

      expect(axios.get).toHaveBeenCalledWith(
        '/records/count',
        expect.objectContaining({ params })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData.length);
    });

    it('can set search and filter params via the store', async () => {
      state = {
        ...getInitialState(),
        search: {
          ...getInitialState().search,
          searchParams: {
            ...getInitialState().search.searchParams,
            dateRange: {
              fromDate: '2022-01-01 00:00:00',
              toDate: '2022-01-02 00:00:00',
            },
            maxShots: MAX_SHOTS_VALUES[0],
          },
        },
        filter: {
          ...getInitialState().filter,
          appliedFilters: [
            [
              { type: 'channel', value: 'shotnum', label: 'Shot Number' },
              operators.find((t) => t.value === '>')!,
              { type: 'number', value: '300', label: '300' },
            ],
          ],
        },
      };

      const { result } = renderHook(() => useIncomingRecordCount(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      params.append(
        'conditions',
        '{"$and":[{"metadata.timestamp":{"$gte":"2022-01-01 00:00:00","$lte":"2022-01-02 00:00:00"}},{"metadata.shotnum":{"$gt":300}}]}'
      );

      expect(axios.get).toHaveBeenCalledWith(
        '/records/count',
        expect.objectContaining({ params })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData.length);
    });

    it.todo(
      'sends axios request to fetch incoming record count and throws an appropriate error on failure'
    );
  });

  describe('useRecordsPaginated', () => {
    let mockData: Record[];
    let params: URLSearchParams;

    beforeEach(() => {
      params = new URLSearchParams();
      mockData = testRecords;
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('sends axios request to fetch records, returns successful response and uses a select function to format the results', async () => {
      const { result } = renderHook(() => useRecordsPaginated(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      params.append('skip', '0');
      params.append('limit', '25');

      expect(axios.get).toHaveBeenCalledWith('/records', {
        params,
        headers: { Authorization: 'Bearer null' },
      });
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(
        dataResponsesEqual(result.current.data, testRecordRows)
      ).toBeTruthy();
    });

    it('can send sort, date range and filter parameters as part of request', async () => {
      state = {
        ...getInitialState(),
        table: {
          ...getInitialState().table,
          sort: { timestamp: 'asc', CHANNEL_1: 'desc' },
        },
        search: {
          ...getInitialState().search,
          searchParams: {
            ...getInitialState().search.searchParams,
            dateRange: {
              fromDate: '2022-01-01 00:00:00',
              toDate: '2022-01-02 00:00:00',
            },
            maxShots: MAX_SHOTS_VALUES[0],
          },
        },
        filter: {
          ...getInitialState().filter,
          appliedFilters: [
            [
              { type: 'channel', value: 'shotnum', label: 'Shot Number' },
              operators.find((t) => t.value === '>')!,
              { type: 'number', value: '300', label: '300' },
            ],
          ],
        },
      };

      const { result } = renderHook(() => useRecordsPaginated(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      params.append('order', 'metadata.timestamp asc');
      params.append('order', 'channels.CHANNEL_1 desc');
      params.append(
        'conditions',
        '{"$and":[{"metadata.timestamp":{"$gte":"2022-01-01 00:00:00","$lte":"2022-01-02 00:00:00"}},{"metadata.shotnum":{"$gt":300}}]}'
      );
      params.append('skip', '0');
      params.append('limit', '25');

      expect(axios.get).toHaveBeenCalledWith('/records', {
        params,
        headers: { Authorization: 'Bearer null' },
      });
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(
        dataResponsesEqual(result.current.data, testRecordRows)
      ).toBeTruthy();
    });
  });

  describe('usePlotRecords', () => {
    let mockData: Record[];
    let params: URLSearchParams;

    const testSelectedPlotChannels: SelectedPlotChannel[] = [
      {
        name: 'test_3',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
          yAxis: 'left',
        },
      },
    ];

    beforeEach(() => {
      params = new URLSearchParams();
      mockData = testRecords;
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('uses a select function to format the results', async () => {
      const { result } = renderHook(
        () => usePlotRecords(testSelectedPlotChannels),
        {
          wrapper: hooksWrapperWithProviders(state),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      // Default params for usePlotRecords
      params.append('order', 'metadata.timestamp asc'); // Assume the user is plotting time-series graph

      // searchParams.maxShots defaults to 50
      params.append('skip', '0');
      params.append('limit', '50');

      expect(axios.get).toHaveBeenCalledWith('/records', {
        params,
        headers: { Authorization: 'Bearer null' },
      });
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );

      const expectedData: PlotDataset[] = [
        {
          name: 'test_3',
          data: [
            {
              // mockData[2] is the test record with a scalar channel
              timestamp: parseISO(mockData[2].metadata.timestamp).getTime(),
              test_3: 333.3,
            },
          ],
        },
      ];

      expect(result.current.data).toEqual(expectedData);
    });

    it('can send x-axis, filter and maxShots params as part of request', async () => {
      state = {
        ...getInitialState(),
        filter: {
          ...getInitialState().filter,
          appliedFilters: [
            [
              { type: 'channel', value: 'shotnum', label: 'Shot Number' },
              operators.find((t) => t.value === '>')!,
              { type: 'number', value: '300', label: '300' },
            ],
          ],
        },
        search: {
          ...getInitialState().search,
          searchParams: {
            ...getInitialState().search.searchParams,
            maxShots: 1000,
          },
        },
      };

      const { result } = renderHook(
        () => usePlotRecords(testSelectedPlotChannels, 'shotnum'),
        {
          wrapper: hooksWrapperWithProviders(state),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      params.append('order', 'metadata.shotnum asc');
      params.append(
        'conditions',
        '{"$and":[{"metadata.shotnum":{"$gt":300}}]}'
      );
      params.append('skip', '0');
      params.append('limit', '1000');

      expect(axios.get).toHaveBeenCalledWith('/records', {
        params,
        headers: { Authorization: 'Bearer null' },
      });
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );

      const expectedData: PlotDataset[] = [
        {
          name: 'test_3',
          data: [
            {
              // mockData[2] is the test record with a scalar channel
              shotnum: 3,
              test_3: 333.3,
            },
          ],
        },
      ];

      expect(result.current.data).toEqual(expectedData);
    });

    it('does not set skip and limit params on request if maxShots === "Unlimited"', async () => {
      state = {
        ...getInitialState(),
        search: {
          ...getInitialState().search,
          searchParams: {
            ...getInitialState().search.searchParams,
            maxShots: Infinity,
          },
        },
      };

      const { result } = renderHook(
        () => usePlotRecords(testSelectedPlotChannels),
        {
          wrapper: hooksWrapperWithProviders(state),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      params.append('order', 'metadata.timestamp asc');

      expect(axios.get).toHaveBeenCalledWith('/records', {
        params,
        headers: { Authorization: 'Bearer null' },
      });
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
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
