import axios from 'axios';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useChannels,
  generateChannelMetadata,
  constructColumns,
  getScalarChannels,
} from './channels';
import { FullChannelMetadata, Record } from '../app.types';
import { testRecords, hooksWrapperWithProviders } from '../setupTests';

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
  });

  describe('constructColumns', () => {
    it('constructs a set of columns from given channel metadata', () => {
      const expected = [
        {
          accessor: 'timestamp',
          Header: 'Timestamp',
        },
        {
          accessor: 'shotnum',
          Header: 'Shot Number',
          channelInfo: {
            channel_dtype: 'scalar',
            systemName: 'shotnum',
            userFriendlyName: 'Shot Number',
          },
        },
        {
          accessor: 'activeArea',
          Header: 'Active Area',
          channelInfo: {
            channel_dtype: 'scalar',
            systemName: 'activeArea',
            userFriendlyName: 'Active Area',
          },
        },
        {
          accessor: 'activeExperiment',
          Header: 'Active Experiment',
          channelInfo: {
            channel_dtype: 'scalar',
            systemName: 'activeExperiment',
            userFriendlyName: 'Active Experiment',
          },
        },
        {
          accessor: 'test_1',
          Header: 'test_1',
          channelInfo: {
            channel_dtype: 'image',
            systemName: 'test_1',
          },
        },
        {
          accessor: 'test_2',
          Header: 'test_2',
          channelInfo: {
            channel_dtype: 'waveform',
            systemName: 'test_2',
          },
        },
        {
          accessor: 'test_3',
          Header: 'test_3',
          channelInfo: {
            channel_dtype: 'scalar',
            systemName: 'test_3',
          },
        },
      ];

      const metadata = generateChannelMetadata(mockData);
      const response = constructColumns(metadata);
      expect(response[0]).toEqual(expected[0]);

      for (let i = 1; i < response.length; i++) {
        expect(response[i].accessor).toEqual(expected[i].accessor);
        expect(response[i]['channelInfo']).toEqual(expected[i].channelInfo);
      }
    });
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
