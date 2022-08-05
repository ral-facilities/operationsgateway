import axios from 'axios';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useChannels,
  generateChannelMetadata,
  constructColumns,
} from './channels';
import { FullChannelMetadata, Record } from '../app.types';
import { testRecords, renderWithProvidersForHook } from '../setupTests';

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
        },
        {
          accessor: 'activeArea',
          Header: 'Active Area',
        },
        {
          accessor: 'activeExperiment',
          Header: 'Active Experiment',
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
      expect(response[1]).toEqual(expected[1]);
      expect(response[2]).toEqual(expected[2]);
      expect(response[3]).toEqual(expected[3]);

      for (let i = 4; i < response.length; i++) {
        expect(response[i].accessor).toEqual(expected[i].accessor);
        expect(response[i]['channelInfo']).toEqual(expected[i].channelInfo);
      }
    });
  });

  describe('useChannels', () => {
    it('sends axios request to fetch channels and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      const { result } = renderHook(() => useChannels(), {
        wrapper: renderWithProvidersForHook(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const expected: FullChannelMetadata[] = [
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

      expect(result.current.data).toEqual(expected);
    });

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });
});
