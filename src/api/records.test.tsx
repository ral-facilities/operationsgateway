import { renderHook, waitFor } from '@testing-library/react';
import { parseISO } from 'date-fns';
import {
  PlotDataset,
  Record,
  ScalarChannel,
  SearchParams,
  SelectedPlotChannel,
  timeChannelName,
} from '../app.types';
import { operators, parseFilter, Token } from '../filtering/filterParser';
import recordsJson from '../mocks/records.json';
import { MAX_SHOTS_VALUES } from '../search/components/maxShots.component';
import { RootState } from '../state/store';
import {
  createTestQueryClient,
  getInitialState,
  hooksWrapperWithProviders,
  waitForRequest,
} from '../testUtils';
import {
  getFormattedAxisData,
  useDateToShotnumConverter,
  useIncomingRecordCount,
  usePlotRecords,
  useRecordCount,
  useRecordsPaginated,
  useShotnumToDateConverter,
  useThumbnails,
} from './records';

describe('records api functions', () => {
  let state: RootState;

  beforeEach(() => {
    state = getInitialState();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('useRecordCount', () => {
    let params: URLSearchParams;

    beforeEach(() => {
      params = new URLSearchParams();
    });

    it('sends request to fetch record count and returns successful response', async () => {
      const { result } = renderHook(() => useRecordCount(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(recordsJson.length);
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

      const pendingRequest = waitForRequest('GET', '/records/count');

      const { result } = renderHook(() => useRecordCount(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const request = await pendingRequest;

      params.append(
        'conditions',
        '{"$and":[{"metadata.timestamp":{"$gte":"2022-01-01 00:00:00","$lte":"2022-01-02 00:00:00"}},{"metadata.shotnum":{"$gt":300}}]}'
      );

      expect(new URL(request.url).searchParams.toString()).toEqual(
        params.toString()
      );
      expect(result.current.data).toEqual(recordsJson.length);
    });

    it('returns cached data from incomingRecordCount request if it is available', async () => {
      state = {
        ...getInitialState(),
        search: {
          ...getInitialState().search,
          searchParams: {
            ...getInitialState().search.searchParams,
            dateRange: {},
          },
        },
      };
      // Test that record count data is reused when we fetch the count of a large request before fetching the records themselves

      // Create a queryClient here and pass it between each hooks instance
      // This ensures a persistent query cache which we can then test with
      const testQueryClient = createTestQueryClient();

      const pendingRequest = waitForRequest('GET', '/records/count');

      // First simulate a call to useIncomingRecordCount hook
      // This simulates the moment a user gets a warning for initiating a request with a large response of records
      const { result: incomingRecordCountResult } = renderHook(
        () => useIncomingRecordCount(),
        {
          wrapper: hooksWrapperWithProviders(state, testQueryClient),
        }
      );

      await waitFor(() => {
        expect(incomingRecordCountResult.current.isSuccess).toBeTruthy();
      });

      const request = await pendingRequest;

      // We should have made one call to /records/count
      expect(new URL(request.url).searchParams.toString()).toEqual(
        params.toString()
      );
      expect(incomingRecordCountResult.current.data).toEqual(
        recordsJson.length
      );

      // "listen" for second call to /records/count that we expect to never happen
      const pendingRequest2 = waitForRequest('GET', '/records/count');
      let isPending = true;
      pendingRequest2.then(() => {
        isPending = false;
      });

      // Next, simulate a call to useRecordCount hook
      // This is the moment a user has heeded the warning of a large response of records and initiated the actual search
      // Normally, we fetch the count of records alongside the records themselves
      // However, we already have that data in the query cache, populated from the useIncomingRecordCount hook!
      const { result: recordCountResult } = renderHook(() => useRecordCount(), {
        wrapper: hooksWrapperWithProviders(state, testQueryClient),
      });

      await waitFor(() => {
        expect(recordCountResult.current.isSuccess).toBeTruthy();
      });

      // Should be no further calls to /records/count
      // This tells us that the cache from the incomingRecordCount query was retrieved
      expect(isPending).toBe(true);

      // The result from the useRecordCount hook should match the result of the useIncomingRecordCount hook
      expect(recordCountResult.current.data).toEqual(
        incomingRecordCountResult.current.data
      );
    });

    it.todo(
      'sends axios request to fetch record count and throws an appropriate error on failure'
    );
  });

  describe('useShotnumToDateConverter', () => {
    it('send a request to fetch date using ShotnumToDateConverter and returns a succesful response', async () => {
      const expectedReponse = {
        from: '2022-01-04T00:00:00',
        to: '2022-01-18T00:00:00',
        min: 4,
        max: 19,
      };

      const { result } = renderHook(
        () =>
          useShotnumToDateConverter(expectedReponse.min, expectedReponse.max),
        {
          wrapper: hooksWrapperWithProviders(state),
        }
      );
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(expectedReponse);
    });
    it('does not send a request to fetch date using ShotnumToDateConverter when query set to disabled', async () => {
      const { result } = renderHook(
        () => useShotnumToDateConverter(undefined, undefined, false),
        {
          wrapper: hooksWrapperWithProviders(state),
        }
      );

      expect(result.current.data).toEqual(undefined);
      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });
    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });

  describe('useDateToShotnumConverter', () => {
    it('send a request to fetch date usingDateToShotnumConverter and returns a succesful response', async () => {
      const expectedReponse = {
        from: '2021-12-01T00:00:00',
        to: '2022-01-19T00:00:00',
        min: 1,
        max: 18,
      };

      const { result } = renderHook(
        () =>
          useDateToShotnumConverter(expectedReponse.from, expectedReponse.to),
        {
          wrapper: hooksWrapperWithProviders(state),
        }
      );
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(expectedReponse);
    });
    it('does not send a request to fetch date usingDateToShotnumConverter when query set to disabled', async () => {
      const { result } = renderHook(
        () => useDateToShotnumConverter(undefined, undefined, false),
        {
          wrapper: hooksWrapperWithProviders(state),
        }
      );

      expect(result.current.data).toEqual(undefined);
      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });
    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });

  describe('useIncomingRecordCount', () => {
    let params: URLSearchParams;

    beforeEach(() => {
      params = new URLSearchParams();
    });

    it('sends request to fetch incoming record count and returns successful response', async () => {
      const { result } = renderHook(() => useIncomingRecordCount(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(recordsJson.length);
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
        experimentID: null,
      };

      const pendingRequest = waitForRequest('GET', '/records/count');

      const { result } = renderHook(
        () => useIncomingRecordCount(testFilterStrings, testSearchParams),
        {
          wrapper: hooksWrapperWithProviders(state),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const request = await pendingRequest;

      params.append(
        'conditions',
        '{"$and":[{"metadata.timestamp":{"$gte":"2022-01-01 00:00:00","$lte":"2022-01-02 00:00:00"}},{"metadata.shotnum":{"$gt":300}}]}'
      );

      expect(new URL(request.url).searchParams.toString()).toEqual(
        params.toString()
      );
      expect(result.current.data).toEqual(recordsJson.length);
    });

    it('can set functions params via the store', async () => {
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
        functions: {
          appliedFunctions: [
            {
              id: '1',
              name: 'a',
              expression: [{ type: 'number', label: '1', value: '1' }],
              dataType: 'scalar',
              channels: ['CHANNEL_1', 'CHANNEL_2'],
            },
          ],
        },
      };

      const pendingRequest = waitForRequest('GET', '/records/count');

      const { result } = renderHook(() => useIncomingRecordCount(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const request = await pendingRequest;

      params.append(
        'conditions',
        '{"$and":[{"metadata.timestamp":{"$gte":"2022-01-01 00:00:00","$lte":"2022-01-02 00:00:00"}}],"$or":[{"channels.CHANNEL_1":{"$exists":true}},{"channels.CHANNEL_2":{"$exists":true}}]}'
      );

      expect(new URL(request.url).searchParams.toString()).toEqual(
        params.toString()
      );
      expect(result.current.data).toEqual(recordsJson.length);
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

      const pendingRequest = waitForRequest('GET', '/records/count');

      const { result } = renderHook(() => useIncomingRecordCount(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const request = await pendingRequest;

      params.append(
        'conditions',
        '{"$and":[{"metadata.timestamp":{"$gte":"2022-01-01 00:00:00","$lte":"2022-01-02 00:00:00"}},{"metadata.shotnum":{"$gt":300}}]}'
      );

      expect(new URL(request.url).searchParams.toString()).toEqual(
        params.toString()
      );
      expect(result.current.data).toEqual(recordsJson.length);
    });

    it.todo(
      'sends axios request to fetch incoming record count and throws an appropriate error on failure'
    );
  });

  describe('useRecordsPaginated', () => {
    let params: URLSearchParams;

    beforeEach(() => {
      params = new URLSearchParams();
    });

    it('sends request to fetch records, returns successful response and uses a select function to format the results', async () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-07-02 12:00:00'));

      const pendingRequest = waitForRequest('GET', '/records');

      const { result } = renderHook(() => useRecordsPaginated(), {
        // don't pass in state here as we want the initial state to be generated after
        // we have our fake timers set up
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const request = await pendingRequest;

      params.append('order', 'metadata.timestamp asc');
      params.append('projection', `metadata.${timeChannelName}`);
      params.append(
        'conditions',
        '{"$and":[{"metadata.timestamp":{"$gte":"2024-07-01T12:00:00","$lte":"2024-07-02T12:00:59"}}]}'
      );
      params.append('skip', '0');
      params.append('limit', '25');

      expect(new URL(request.url).searchParams.toString()).toEqual(
        params.toString()
      );

      expect(result.current.data).toMatchSnapshot();
    });

    it('can send sort, date range, projection functions and filter parameters as part of request', async () => {
      state = {
        ...getInitialState(),
        table: {
          ...getInitialState().table,
          sort: { timestamp: 'asc', CHANNEL_1: 'desc' },
          selectedColumnIds: [timeChannelName, 'CHANNEL_1'],
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
        functions: {
          appliedFunctions: [
            {
              id: '1',
              name: 'a',
              expression: [{ type: 'number', label: '1', value: '1' }],
              dataType: 'scalar',
              channels: ['CHANNEL_1', 'CHANNEL_2'],
            },
          ],
        },
      };

      const pendingRequest = waitForRequest('GET', '/records');

      const { result } = renderHook(() => useRecordsPaginated(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const request = await pendingRequest;

      params.append('order', 'metadata.timestamp asc');
      params.append('order', 'channels.CHANNEL_1 desc');
      params.append('projection', `metadata.${timeChannelName}`);
      params.append('projection', 'channels.CHANNEL_1');
      params.append(
        'functions',
        JSON.stringify({ name: 'a', expression: '1' })
      );
      params.append(
        'conditions',
        '{"$and":[{"metadata.timestamp":{"$gte":"2022-01-01 00:00:00","$lte":"2022-01-02 00:00:00"}},{"metadata.shotnum":{"$gt":300}}],"$or":[{"channels.CHANNEL_1":{"$exists":true}},{"channels.CHANNEL_2":{"$exists":true}}]}'
      );
      params.append('skip', '0');
      params.append('limit', '25');

      expect(new URL(request.url).searchParams.toString()).toEqual(
        params.toString()
      );
    });
  });

  describe('usePlotRecords', () => {
    let params: URLSearchParams;

    const testSelectedPlotChannels: SelectedPlotChannel[] = [
      {
        name: 'CHANNEL_ABCDE',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
          yAxis: 'left',
        },
        units: 'cm',
      },
    ];

    beforeEach(() => {
      params = new URLSearchParams();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('uses a select function to format the results', async () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-07-02 12:00:00'));

      const pendingRequest = waitForRequest('GET', '/records');

      const { result } = renderHook(
        () => usePlotRecords(testSelectedPlotChannels),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const request = await pendingRequest;

      // Default params for usePlotRecords
      params.append('order', 'metadata.timestamp asc'); // Assume the user is plotting time-series graph

      // correct projections added
      params.append('projection', `metadata.${timeChannelName}`);
      testSelectedPlotChannels.forEach((channel) => {
        params.append('projection', `channels.${channel.name}`);
      });

      // correct conditions added
      params.append(
        'conditions',
        '{"$and":[{"metadata.timestamp":{"$gte":"2024-07-01T12:00:00","$lte":"2024-07-02T12:00:59"}}],"$or":[{"channels.CHANNEL_ABCDE":{"$exists":true}}]}'
      );

      // searchParams.maxShots defaults to 50
      params.append('skip', '0');
      params.append('limit', '50');

      expect(new URL(request.url).searchParams.toString()).toEqual(
        params.toString()
      );

      const expectedData: PlotDataset[] = [
        {
          name: 'CHANNEL_ABCDE',
          data: [
            {
              timestamp: parseISO(recordsJson[0].metadata.timestamp).getTime(),
              CHANNEL_ABCDE: 1,
            },
            {
              timestamp: parseISO(recordsJson[1].metadata.timestamp).getTime(),
              CHANNEL_ABCDE: 2,
            },
            {
              timestamp: parseISO(recordsJson[2].metadata.timestamp).getTime(),
              CHANNEL_ABCDE: 3,
            },
          ],
        },
      ];

      expect(result.current.data).toEqual(expectedData);
    });

    it('can send x-axis, filter, functions and maxShots params as part of request', async () => {
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
        functions: {
          appliedFunctions: [
            {
              id: '1',
              name: 'a',
              expression: [{ type: 'number', label: '1', value: '1' }],
              dataType: 'scalar',
              channels: [],
            },
          ],
        },
        search: {
          ...getInitialState().search,
          searchParams: {
            ...getInitialState().search.searchParams,
            maxShots: 1000,
            dateRange: {},
          },
        },
      };

      const pendingRequest = waitForRequest('GET', '/records');

      const { result } = renderHook(
        () => usePlotRecords(testSelectedPlotChannels, 'shotnum'),
        {
          wrapper: hooksWrapperWithProviders(state),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const request = await pendingRequest;

      params.append('order', 'metadata.shotnum asc');
      params.append('projection', 'metadata.shotnum');

      const existsConditions: { [x: string]: { $exists: boolean } }[] = [];

      testSelectedPlotChannels.forEach((channel) => {
        params.append('projection', `channels.${channel.name}`);
        existsConditions.push({
          [`channels.${channel.name}`]: { $exists: true },
        });
      });

      params.append(
        'functions',
        JSON.stringify({ name: 'a', expression: '1' })
      );

      params.append(
        'conditions',
        '{"$and":[{"metadata.shotnum":{"$gt":300}}],"$or":' +
          JSON.stringify(existsConditions) +
          '}'
      );

      params.append('skip', '0');
      params.append('limit', '1000');

      expect(new URL(request.url).searchParams.toString()).toEqual(
        params.toString()
      );

      const expectedData: PlotDataset[] = [
        {
          name: 'CHANNEL_ABCDE',
          data: [
            {
              CHANNEL_ABCDE: 1,
              shotnum: 1,
            },
            {
              CHANNEL_ABCDE: 2,
              shotnum: 2,
            },
            {
              CHANNEL_ABCDE: 3,
              shotnum: 3,
            },
          ],
        },
      ];

      expect(result.current.data).toEqual(expectedData);
    });

    it('does not set skip and limit params on request if maxShots === "Unlimited"', async () => {
      const pendingRequest = waitForRequest('GET', '/records');

      state = {
        ...getInitialState(),
        search: {
          ...getInitialState().search,
          searchParams: {
            ...getInitialState().search.searchParams,
            maxShots: Infinity,
            dateRange: {},
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

      const request = await pendingRequest;

      params.append('order', 'metadata.timestamp asc');
      params.append('projection', `metadata.${timeChannelName}`);
      const existsConditions: { [x: string]: { $exists: boolean } }[] = [];
      testSelectedPlotChannels.forEach((channel) => {
        params.append('projection', `channels.${channel.name}`);
        existsConditions.push({
          [`channels.${channel.name}`]: { $exists: true },
        });
      });

      params.append(
        'conditions',
        '{"$or":' + JSON.stringify(existsConditions) + '}'
      );

      expect(new URL(request.url).searchParams.toString()).toEqual(
        params.toString()
      );
    });
  });

  describe('useThumbnails', () => {
    let params: URLSearchParams;

    beforeEach(() => {
      params = new URLSearchParams();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('sends request to fetch records with a projection and returns successful response', async () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-07-02 12:00:00'));

      const pendingRequest = waitForRequest('GET', '/records');

      const { result } = renderHook(() => useThumbnails('TEST', 1, 25), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const request = await pendingRequest;

      params.append('order', 'metadata.timestamp asc');
      params.append('projection', 'channels.TEST');
      params.append('projection', 'metadata.timestamp');

      params.append(
        'conditions',
        '{"$and":[{"metadata.timestamp":{"$gte":"2024-07-01T12:00:00","$lte":"2024-07-02T12:00:59"}}],"$or":[{"channels.TEST":{"$exists":true}}]}'
      );

      params.append('skip', '25');
      params.append('limit', '25');

      expect(new URL(request.url).searchParams.toString()).toEqual(
        params.toString()
      );

      expect(result.current.data).toEqual(recordsJson);
    });

    it('can send sort, date range, functions and filter parameters as part of request', async () => {
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
        functions: {
          appliedFunctions: [
            {
              id: '1',
              name: 'a',
              expression: [{ type: 'number', label: '1', value: '1' }],
              dataType: 'scalar',
              channels: [],
            },
          ],
        },
      };

      const pendingRequest = waitForRequest('GET', '/records');

      const { result } = renderHook(() => useThumbnails('TEST', 0, 25), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const request = await pendingRequest;

      params.append('order', 'metadata.timestamp asc');
      params.append('order', 'channels.CHANNEL_1 desc');
      params.append('projection', 'channels.TEST');
      params.append('projection', 'metadata.timestamp');
      params.append(
        'functions',
        JSON.stringify({ name: 'a', expression: '1' })
      );
      params.append(
        'conditions',
        '{"$and":[{"metadata.timestamp":{"$gte":"2022-01-01 00:00:00","$lte":"2022-01-02 00:00:00"}},{"metadata.shotnum":{"$gt":300}}],"$or":[{"channels.TEST":{"$exists":true}}]}'
      );
      params.append('skip', '0');
      params.append('limit', '25');

      expect(new URL(request.url).searchParams.toString()).toEqual(
        params.toString()
      );
    });
  });

  describe('getFormattedAxisData function', () => {
    let testRecord: Record;

    beforeEach(() => {
      // this has the scalar channel CHANNEL_ABCDE
      testRecord = recordsJson[0] as Record;
    });

    it('formats timestamp correctly', () => {
      const unixTimestamp = parseISO(testRecord.metadata.timestamp).getTime();
      const result = getFormattedAxisData(testRecord, 'timestamp');
      expect(result).toEqual(unixTimestamp);
    });

    it('formats shot number correctly', () => {
      let result = getFormattedAxisData(testRecord, 'shotnum');
      expect(result).toEqual(testRecord.metadata.shotnum);

      testRecord.metadata.shotnum = undefined;
      result = getFormattedAxisData(testRecord, 'shotnum');
      expect(result).toEqual(NaN);
    });

    it('formats activeArea correctly', () => {
      let result = getFormattedAxisData(testRecord, 'activeArea');
      expect(result).toEqual(NaN);

      testRecord.metadata.activeArea = '3';
      result = getFormattedAxisData(testRecord, 'activeArea');
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
      let result = getFormattedAxisData(testRecord, 'CHANNEL_ABCDE');
      expect(result).toEqual(
        (testRecord.channels?.['CHANNEL_ABCDE'] as ScalarChannel).data
      );

      (testRecord.channels?.['CHANNEL_ABCDE'] as ScalarChannel).data = '1';
      result = getFormattedAxisData(testRecord, 'CHANNEL_ABCDE');
      expect(result).toEqual(1);

      result = getFormattedAxisData(testRecord, 'invalid_channel');
      expect(result).toEqual(NaN);
    });
  });
});
