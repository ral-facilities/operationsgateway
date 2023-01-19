/* eslint-disable @typescript-eslint/no-non-null-assertion */
import axios from 'axios';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useChannels,
  useAvailableColumns,
  getScalarChannels,
  staticChannels,
} from './channels';
import { FullChannelMetadata } from '../app.types';
import {
  testChannels,
  hooksWrapperWithProviders,
  getInitialState,
} from '../setupTests';
import { PreloadedState } from '@reduxjs/toolkit';
import { RootState } from '../state/store';

describe('channels api functions', () => {
  let mockData: FullChannelMetadata[];

  beforeEach(() => {
    // remove the first 4 items i.e. the staticChannels as these are added by fetchChannels
    mockData = testChannels.slice(4);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useAvailableColumns', () => {
    let state: PreloadedState<RootState>;

    beforeEach(() => {
      state = getInitialState();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('uses a select function to construct an array of columns from given channel metadata', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: { channels: mockData },
      });

      const expected = [
        {
          accessor: 'timestamp',
          Header: () => 'Time',
          Cell: expect.anything(),
          channelInfo: staticChannels['timestamp'],
        },
        {
          accessor: 'shotnum',
          Header: () => 'Shot Number',
          Cell: expect.anything(),
          channelInfo: staticChannels['shotnum'],
        },
        {
          accessor: 'activeArea',
          Header: () => 'Active Area',
          Cell: expect.anything(),
          channelInfo: staticChannels['activeArea'],
        },
        {
          accessor: 'activeExperiment',
          Header: () => 'Active Experiment',
          Cell: expect.anything(),
          channelInfo: staticChannels['activeExperiment'],
        },
        {
          accessor: 'test_1',
          Header: () => 'test_1',
          channelInfo: {
            type: 'scalar',
            name: 'Test 1',
            precision: 4,
            systemName: 'test_1',
            path: '/test_1',
          },
        },
        {
          accessor: 'test_2',
          Header: () => 'test_2',
          channelInfo: {
            type: 'scalar',
            systemName: 'test_2',
            path: '/test_2',
            notation: 'normal',
            precision: 2,
          },
        },
        {
          accessor: 'test_3',
          Header: () => 'test_3',
          Cell: expect.anything(),
          channelInfo: {
            type: 'scalar',
            systemName: 'test_3',
            path: '/test_3',
            notation: 'scientific',
            precision: 2,
          },
        },
      ];

      const { result } = renderHook(() => useAvailableColumns(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(axios.get).toHaveBeenCalledWith('/channels', {
        headers: { Authorization: 'Bearer null' },
      });
      expect(result.current.data).not.toBeUndefined();

      const data = result.current.data;

      for (let i = 0; i < data!.length; i++) {
        expect(data![i].accessor).toEqual(expected[i].accessor);
        expect(data![i]['channelInfo']).toEqual(expected[i].channelInfo);
      }
    });

    it('returns no columns if no data was present in the request response', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: { channels: {} },
      });

      const { result } = renderHook(() => useAvailableColumns(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(axios.get).toHaveBeenCalledWith('/channels', {
        headers: { Authorization: 'Bearer null' },
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
    beforeEach(() => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: { channels: mockData },
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('sends axios request to fetch channels and returns successful response', async () => {
      const { result } = renderHook(() => useChannels(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const expected: FullChannelMetadata[] = [
        ...Object.values(staticChannels),
        {
          type: 'scalar',
          name: 'Test 1',
          precision: 4,
          systemName: 'test_1',
          path: '/test_1',
        },
        {
          type: 'scalar',
          systemName: 'test_2',
          path: '/test_2',
          notation: 'normal',
          precision: 2,
        },
        {
          type: 'scalar',
          systemName: 'test_3',
          path: '/test_3',
          notation: 'scientific',
          precision: 2,
        },
      ];

      expect(axios.get).toHaveBeenCalledWith('/channels', {
        headers: { Authorization: 'Bearer null' },
      });
      expect(result.current.data).toEqual(expected);
    });

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });
});
