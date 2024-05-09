import axios from 'axios';
import { useExportData } from './export';
import { renderHook, waitFor } from '@testing-library/react';
import { hooksWrapperWithProviders, getInitialState } from '../setupTests';

jest.mock('axios');

describe('useExportData', () => {
  let state = getInitialState();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends axios request to export data and returns successful response', async () => {
    (axios.get as jest.Mock).mockResolvedValue({});

    state = {
      ...getInitialState(),
      selection: {
        selectedRows: ['1', '2', '3'],
      },
      table: {
        ...getInitialState().table,
        selectedColumnIds: ['timestamp', 'ChannelA', 'ChannelB'],
        page: 1,
        resultsPerPage: 25,
        sort: { timestamp: 'desc' },
      },
      search: {
        ...getInitialState().search,
        searchParams: {
          ...getInitialState().search.searchParams,
          dateRange: {
            fromDate: '2022-10-17T00:00:00',
            toDate: '2022-11-04T23:59:59',
          },
          maxShots: 1000,
        },
      },
    };

    const { result } = renderHook(() => useExportData(), {
      wrapper: hooksWrapperWithProviders(state),
    });

    expect(axios.get).not.toHaveBeenCalled();
    expect(result.current.isIdle).toBe(true);

    result.current.mutate({
      exportType: 'Selected Rows',
      dataToExport: {
        Scalars: true,
        Images: false,
        'Waveform CSVs': true,
        'Waveform Images': false,
      },
    });

    await waitFor(() => result.current.isSuccess);

    //TODO: there must be a better way to do this 😅
    const params = new URLSearchParams();
    params.append('order', 'metadata.timestamp desc');
    params.append('projection', 'metadata.timestamp');
    params.append('projection', 'channels.ChannelA');
    params.append('projection', 'channels.ChannelB');
    params.append(
      'conditions',
      JSON.stringify({
        $and: [
          {
            'metadata.timestamp': {
              $gte: '2022-10-17T00:00:00',
              $lte: '2022-11-04T23:59:59',
            },
          },
          { _id: { $in: ['1', '2', '3'] } },
        ],
        $or: [
          { 'channels.ChannelA': { $exists: true } },
          { 'channels.ChannelB': { $exists: true } },
        ],
      })
    );
    params.append('export_scalars', 'true');
    params.append('export_images', 'false');
    params.append('export_waveform_csvs', 'true');
    params.append('export_waveform_images', 'false');
    params.append('skip', '0');
    params.append('limit', '0');

    console.log(params.toString());

    expect(axios.get).toHaveBeenCalledWith('/export', {
      params,
      headers: {
        Authorization: 'Bearer null',
      },
      responseType: 'blob',
    });
  });

  it.todo(
    'sends request to export data and throws an appropriate error on failure'
  );
});
