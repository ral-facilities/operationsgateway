/* eslint-disable @typescript-eslint/no-non-null-assertion */
import axios from 'axios';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useChannels,
  generateChannelMetadata,
  useAvailableColumns,
  getScalarChannels,
  extractChannelsFromTokens,
} from './channels';
import { FullChannelMetadata, Record } from '../app.types';
import {
  testRecords,
  hooksWrapperWithProviders,
  getInitialState,
} from '../setupTests';
import { operators, Token } from '../filtering/filterParser';
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

    it('uses a select function to construct an array of columns from given channel metadata and filtered channel info', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: mockData,
      });

      const appliedFilters: Token[][] = [
        [
          { type: 'channel', value: 'shotnum', label: 'Shot Number' },
          operators.find((t) => t.value === '>')!,
          { type: 'number', value: '300', label: '300' },
        ],
        [
          { type: 'channel', value: 'test_2', label: 'TEST_2' },
          operators.find((t) => t.value === '<')!,
          { type: 'number', value: '5', label: '5' },
        ],
      ];
      const expected = [
        {
          accessor: 'timestamp',
          Header: () => 'Time',
          Cell: expect.anything(),
          filtered: false,
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
          filtered: true,
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
          filtered: false,
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
          filtered: false,
          channelInfo: {
            channel_dtype: 'scalar',
            systemName: 'activeExperiment',
            userFriendlyName: 'Active Experiment',
          },
        },
        {
          accessor: 'test_1',
          Header: () => 'test_1',
          filtered: false,
          channelInfo: {
            channel_dtype: 'image',
            systemName: 'test_1',
          },
        },
        {
          accessor: 'test_2',
          Header: () => 'test_2',
          filtered: true,
          channelInfo: {
            channel_dtype: 'waveform',
            systemName: 'test_2',
          },
        },
        {
          accessor: 'test_3',
          Header: () => 'test_3',
          Cell: expect.anything(),
          filtered: false,
          channelInfo: {
            channel_dtype: 'scalar',
            systemName: 'test_3',
          },
        },
      ];

      const { result } = renderHook(() => useAvailableColumns(appliedFilters), {
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
        expect(data![i]['filtered']).toEqual(expected[i].filtered);
        expect(data![i]['channelInfo']).toEqual(expected[i].channelInfo);
      }
    });

    it('returns no columns if no data was present in the request response', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: [],
      });

      const { result } = renderHook(() => useAvailableColumns([[]]), {
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

  describe('extractChannelsFromTokens', () => {
    it('returns an array of unique channel values', () => {
      const timestampToken: Token = {
        type: 'channel',
        value: 'timestamp',
        label: 'Time',
      };
      const channelToken: Token = {
        type: 'channel',
        value: 'CHANNEL_1',
        label: 'Channel 1',
      };
      const expected = [timestampToken.value, channelToken.value];

      const firstFilter = [operators[0], timestampToken, operators[1]];
      const secondFilter = [operators[2], channelToken, operators[3]];
      const thirdFilter = [operators[4], channelToken, operators[5]];
      const testInput = [firstFilter, secondFilter, thirdFilter];

      const result = extractChannelsFromTokens(testInput);
      expect(result).toEqual(expected);
    });

    it('returns an empty array if no channels are present in the filters', () => {
      const result = extractChannelsFromTokens([[...operators]]);
      expect(result).toEqual([]);
    });
  });
});
