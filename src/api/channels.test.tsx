/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { renderHook, waitFor } from '@testing-library/react';
import {
  useChannels,
  useAvailableColumns,
  getScalarChannels,
  staticChannels,
  useChannelSummary,
  ChannelSummary,
} from './channels';
import { FullChannelMetadata, timeChannelName } from '../app.types';
import {
  hooksWrapperWithProviders,
  getInitialState,
  testChannels,
} from '../setupTests';
import { RootState } from '../state/store';
import { server } from '../mocks/server';
import { rest } from 'msw';

describe('channels api functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useAvailableColumns', () => {
    let state: RootState;

    beforeEach(() => {
      state = getInitialState();
    });

    it('uses a select function to construct an array of columns from given channel metadata', async () => {
      const { result } = renderHook(() => useAvailableColumns(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const data = result.current.data;

      expect(data).not.toBeUndefined();

      const timestampCol = data!.find((col) => col.id === timeChannelName);

      // assert it converts a static channel correctly
      expect(timestampCol).toEqual({
        id: 'timestamp',
        accessorKey: 'timestamp',
        header: expect.any(Function),
        cell: expect.any(Function),
        meta: { channelInfo: staticChannels['timestamp'] },
      });

      const channelCol = data!.find((col) => col.id === 'CHANNEL_DEFGH');

      // assert it converts a normal channel correctly
      expect(channelCol).toEqual({
        id: 'CHANNEL_DEFGH',
        accessorKey: 'CHANNEL_DEFGH',
        header: expect.any(Function),
        cell: expect.any(Function),
        meta: {
          channelInfo: {
            type: 'scalar',
            name: 'Channel_DEFGH',
            notation: 'scientific',
            precision: 2,
            systemName: 'CHANNEL_DEFGH',
            path: '/Channels/2',
          },
        },
      });
    });

    it('returns no columns if no data was present in the request response', async () => {
      server.use(
        rest.get('/channels', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ channels: {} }));
        })
      );

      const { result } = renderHook(() => useAvailableColumns(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual([]);
    });

    it.todo(
      'sends axios request to fetch channels and throws an appropriate error on failure'
    );
  });

  describe('getScalarChannels', () => {
    let channels: FullChannelMetadata[];

    beforeEach(() => {
      channels = [
        {
          type: 'image',
          systemName: 'test_1',
          path: '/test_1',
        },
        {
          type: 'waveform',
          systemName: 'test_2',
          path: '/test_2',
        },
        {
          type: 'scalar',
          systemName: 'test_3',
          path: '/test_3',
        },
      ];
    });

    it('returns scalar channels in channel array', () => {
      const result = getScalarChannels(channels);
      expect(result).toEqual([
        {
          type: 'scalar',
          systemName: 'test_3',
          path: '/test_3',
        },
      ]);
    });

    it('returns empty array if no scalar channels exist', () => {
      channels = [
        {
          type: 'image',
          systemName: 'test_1',
          path: '/test_1',
        },
        {
          type: 'waveform',
          systemName: 'test_2',
          path: '/test_2',
        },
      ];

      const result = getScalarChannels(channels);
      expect(result).toEqual([]);
    });
  });

  describe('useChannels', () => {
    it('sends request to fetch channels and returns successful response', async () => {
      const { result } = renderHook(() => useChannels(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const expected = testChannels;

      expect(result.current.data).toEqual(expected);
    });

    it('returns no channels if no data was present in the request response', async () => {
      server.use(
        rest.get('/channels', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ channels: {} }));
        })
      );

      const { result } = renderHook(() => useChannels(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual([]);
    });

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });

  describe('useChannelSummary', () => {
    it('sends request to fetch channel summary and returns successful response', async () => {
      const { result } = renderHook(() => useChannelSummary('CHANNEL_ABCDE'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const expected: ChannelSummary = {
        first_date: '2022-01-29T00:00:00',
        most_recent_date: '2023-01-31T00:00:00',
        recent_sample: [
          { '2022-01-31T00:00:00': 6 },
          { '2022-01-30T00:00:00': 5 },
          { '2022-01-29T00:00:00': 4 },
        ],
      };

      expect(result.current.data).toEqual(expected);
    });

    it('does not send request to fetch channel summary when given no channel or system channel', async () => {
      let requestSent = false;
      server.events.on('request:start', () => {
        requestSent = true;
      });

      const { result, rerender } = renderHook(
        (channel?: string) => useChannelSummary(channel),
        {
          wrapper: hooksWrapperWithProviders(),
          initialProps: undefined,
        }
      );

      expect(result.current.isFetching).toBeFalsy();
      expect(result.current.isPending).toBeTruthy();
      expect(requestSent).toBe(false);

      rerender('timestamp');

      expect(result.current.isFetching).toBeFalsy();
      expect(result.current.isPending).toBeTruthy();
      expect(requestSent).toBe(false);
    });

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });
});
