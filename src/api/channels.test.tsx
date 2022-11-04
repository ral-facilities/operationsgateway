/* eslint-disable @typescript-eslint/no-non-null-assertion */
import axios from 'axios';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useChannels,
  generateChannelMetadata,
  useAvailableColumns,
  getScalarChannels,
} from './channels';
import { FullChannelMetadata, Record } from '../app.types';
import {
  testRecords,
  hooksWrapperWithProviders,
  getInitialState,
} from '../setupTests';
import { PreloadedState } from '@reduxjs/toolkit';
import { RootState } from '../state/store';

describe('channels api functions', () => {
  let mockData: Record[];

  beforeEach(() => {
    mockData = testRecords;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateChannelMetadata', () => {
    it('generates a set of metadata for all channels parsed from records', () => {
      const expected: FullChannelMetadata[] = [
        {
          channel_dtype: 'scalar',
          systemName: 'timestamp',
          userFriendlyName: 'Time',
        },
        {
          channel_dtype: 'scalar',
          systemName: 'shotnum',
          userFriendlyName: 'Shot Number',
        },
        {
          channel_dtype: 'scalar',
          systemName: 'activeArea',
          userFriendlyName: 'Active Area',
        },
        {
          channel_dtype: 'scalar',
          systemName: 'activeExperiment',
          userFriendlyName: 'Active Experiment',
        },
        {
          channel_dtype: 'image',
          systemName: 'test_1',
        },
        {
          channel_dtype: 'waveform',
          systemName: 'test_2',
        },
        {
          channel_dtype: 'scalar',
          systemName: 'test_3',
        },
      ];

      const response = generateChannelMetadata(mockData);
      expect(response).toEqual(expected);
    });

    it('should not return any metadata if there are no records present in the response', () => {
      const response = generateChannelMetadata([]);
      expect(response).toEqual([]);
    });
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
        data: mockData,
      });

      const expected = [
        {
          accessor: 'timestamp',
          Header: () => 'Time',
          Cell: expect.anything(),
          channelInfo: {
            channel_dtype: 'scalar',
            systemName: 'timestamp',
            userFriendlyName: 'Time',
          },
        },
        {
          accessor: 'shotnum',
          Header: () => 'Shot Number',
          Cell: expect.anything(),
          channelInfo: {
            channel_dtype: 'scalar',
            systemName: 'shotnum',
            userFriendlyName: 'Shot Number',
          },
        },
        {
          accessor: 'activeArea',
          Header: () => 'Active Area',
          Cell: expect.anything(),
          channelInfo: {
            channel_dtype: 'scalar',
            systemName: 'activeArea',
            userFriendlyName: 'Active Area',
          },
        },
        {
          accessor: 'activeExperiment',
          Header: () => 'Active Experiment',
          Cell: expect.anything(),
          channelInfo: {
            channel_dtype: 'scalar',
            systemName: 'activeExperiment',
            userFriendlyName: 'Active Experiment',
          },
        },
        {
          accessor: 'test_1',
          Header: () => 'test_1',
          channelInfo: {
            channel_dtype: 'image',
            systemName: 'test_1',
          },
        },
        {
          accessor: 'test_2',
          Header: () => 'test_2',
          channelInfo: {
            channel_dtype: 'waveform',
            systemName: 'test_2',
          },
        },
        {
          accessor: 'test_3',
          Header: () => 'test_3',
          Cell: expect.anything(),
          channelInfo: {
            channel_dtype: 'scalar',
            systemName: 'test_3',
          },
        },
      ];

      const { result } = renderHook(() => useAvailableColumns(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(axios.get).toHaveBeenCalledWith('/records');
      expect(result.current.data).not.toBeUndefined();

      const data = result.current.data;

      for (let i = 0; i < data!.length; i++) {
        expect(data![i].accessor).toEqual(expected[i].accessor);
        expect(data![i]['channelInfo']).toEqual(expected[i].channelInfo);
      }
    });

    it('returns no columns if no data was present in the request response', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: [],
      });

      const { result } = renderHook(() => useAvailableColumns(), {
        wrapper: hooksWrapperWithProviders(state),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(axios.get).toHaveBeenCalledWith('/records');
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
          channel_dtype: 'image',
          systemName: 'test_1',
        },
        {
          channel_dtype: 'waveform',
          systemName: 'test_2',
        },
        {
          channel_dtype: 'scalar',
          systemName: 'test_3',
        },
      ];
    });

    it('returns scalar channels in channel array', () => {
      const result = getScalarChannels(channels);
      expect(result).toEqual([
        {
          channel_dtype: 'scalar',
          systemName: 'test_3',
        },
      ]);
    });

    it('returns empty array if no scalar channels exist', () => {
      channels = [
        {
          channel_dtype: 'image',
          systemName: 'test_1',
        },
        {
          channel_dtype: 'waveform',
          systemName: 'test_2',
        },
      ];

      const result = getScalarChannels(channels);
      expect(result).toEqual([]);
    });
  });

  describe('useChannels', () => {
    beforeEach(() => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
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
        {
          channel_dtype: 'scalar',
          systemName: 'timestamp',
          userFriendlyName: 'Time',
        },
        {
          channel_dtype: 'scalar',
          systemName: 'shotnum',
          userFriendlyName: 'Shot Number',
        },
        {
          channel_dtype: 'scalar',
          systemName: 'activeArea',
          userFriendlyName: 'Active Area',
        },
        {
          channel_dtype: 'scalar',
          systemName: 'activeExperiment',
          userFriendlyName: 'Active Experiment',
        },
        {
          channel_dtype: 'image',
          systemName: 'test_1',
        },
        {
          channel_dtype: 'waveform',
          systemName: 'test_2',
        },
        {
          channel_dtype: 'scalar',
          systemName: 'test_3',
        },
      ];

      expect(axios.get).toHaveBeenCalledWith('/records');
      expect(result.current.data).toEqual(expected);
    });

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });
});
