import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { RootState } from '../state/store';
import { getInitialState, hooksWrapperWithProviders } from '../testUtils';
import { useExportData } from './export';

describe('useExportData', () => {
  let state: RootState;
  const mockLinkClick = jest.fn();
  const mockLinkRemove = jest.fn();
  let mockLink: HTMLAnchorElement = {};

  beforeEach(() => {
    state = getInitialState();
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
    mockLink = {
      href: '',
      download: '',
      click: mockLinkClick,
      remove: mockLinkRemove,
      target: '',
      style: {},
    };

    document.originalCreateElement = document.createElement;
    document.body.originalAppendChild = document.body.appendChild;
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.createElement = document.originalCreateElement;
    document.body.appendChild = document.body.originalAppendChild;
  });

  it('sends axios request to export selected rows and returns successful response', async () => {
    const getSpy = jest.spyOn(axios, 'get');

    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') return mockLink;
      else return document.originalCreateElement(tag);
    });
    document.body.appendChild = jest.fn().mockImplementation((node) => {
      if (!(node instanceof Node)) return mockLink;
      else return document.body.originalAppendChild(node);
    });

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

    expect(getSpy).toHaveBeenCalledWith('/export', {
      params,
      headers: {
        Authorization: 'Bearer null',
      },
      responseType: 'blob',
    });

    expect(mockLink.href).toEqual('testObjectUrl');
    expect(mockLink.download).toEqual('scwcdownload.csv');
    expect(mockLink.style.display).toEqual('none');

    expect(mockLinkClick).toHaveBeenCalled();
    expect(mockLinkRemove).toHaveBeenCalled();
  });

  it('sends axios request to export all rows and returns successful response', async () => {
    const getSpy = jest.spyOn(axios, 'get');

    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') return mockLink;
      else return document.originalCreateElement(tag);
    });
    document.body.appendChild = jest.fn().mockImplementation((node) => {
      if (!(node instanceof Node)) return mockLink;
      else return document.body.originalAppendChild(node);
    });

    const { result } = renderHook(() => useExportData(), {
      wrapper: hooksWrapperWithProviders(state),
    });

    expect(axios.get).not.toHaveBeenCalled();
    expect(result.current.isIdle).toBe(true);

    result.current.mutate({
      exportType: 'All Rows',
      dataToExport: {
        Scalars: false,
        Images: true,
        'Waveform CSVs': false,
        'Waveform Images': true,
      },
    });

    await waitFor(() => result.current.isSuccess);

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
        ],
        $or: [
          { 'channels.ChannelA': { $exists: true } },
          { 'channels.ChannelB': { $exists: true } },
        ],
      })
    );
    params.append('export_scalars', 'false');
    params.append('export_images', 'true');
    params.append('export_waveform_csvs', 'false');
    params.append('export_waveform_images', 'true');
    params.append('skip', '0');
    params.append('limit', '1000');

    expect(getSpy).toHaveBeenCalledWith('/export', {
      params,
      headers: {
        Authorization: 'Bearer null',
      },
      responseType: 'blob',
    });

    expect(mockLink.href).toEqual('testObjectUrl');
    expect(mockLink.download).toEqual('imwidownload.csv');
    expect(mockLink.style.display).toEqual('none');

    expect(mockLinkClick).toHaveBeenCalled();
    expect(mockLinkRemove).toHaveBeenCalled();
  });

  it('sends axios request to export visible rows and returns successful response', async () => {
    const getSpy = jest.spyOn(axios, 'get');

    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') return mockLink;
      else return document.originalCreateElement(tag);
    });
    document.body.appendChild = jest.fn().mockImplementation((node) => {
      if (!(node instanceof Node)) return mockLink;
      else return document.body.originalAppendChild(node);
    });

    const { result } = renderHook(() => useExportData(), {
      wrapper: hooksWrapperWithProviders(state),
    });

    expect(axios.get).not.toHaveBeenCalled();
    expect(result.current.isIdle).toBe(true);

    result.current.mutate({
      exportType: 'Visible Rows',
      dataToExport: {
        Scalars: true,
        Images: false,
        'Waveform CSVs': false,
        'Waveform Images': false,
      },
    });

    await waitFor(() => result.current.isSuccess);

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
        ],
        $or: [
          { 'channels.ChannelA': { $exists: true } },
          { 'channels.ChannelB': { $exists: true } },
        ],
      })
    );
    params.append('export_scalars', 'true');
    params.append('export_images', 'false');
    params.append('export_waveform_csvs', 'false');
    params.append('export_waveform_images', 'false');
    params.append('skip', '25');
    params.append('limit', '25');

    expect(getSpy).toHaveBeenCalledWith('/export', {
      params,
      headers: {
        Authorization: 'Bearer null',
      },
      responseType: 'blob',
    });

    expect(mockLink.href).toEqual('testObjectUrl');
    expect(mockLink.download).toEqual('scdownload.csv');
    expect(mockLink.style.display).toEqual('none');

    expect(mockLinkClick).toHaveBeenCalled();
    expect(mockLinkRemove).toHaveBeenCalled();
  });

  it('sends axios request without skip and limit when maxShots is unlimited and exporting all rows', async () => {
    state.search.searchParams.maxShots = Infinity;

    const getSpy = jest.spyOn(axios, 'get');

    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') return mockLink;
      else return document.originalCreateElement(tag);
    });
    document.body.appendChild = jest.fn().mockImplementation((node) => {
      if (!(node instanceof Node)) return mockLink;
      else return document.body.originalAppendChild(node);
    });

    const { result } = renderHook(() => useExportData(), {
      wrapper: hooksWrapperWithProviders(state),
    });

    expect(axios.get).not.toHaveBeenCalled();
    expect(result.current.isIdle).toBe(true);

    result.current.mutate({
      exportType: 'All Rows',
      dataToExport: {
        Scalars: true,
        Images: false,
        'Waveform CSVs': false,
        'Waveform Images': false,
      },
    });

    await waitFor(() => result.current.isSuccess);

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
        ],
        $or: [
          { 'channels.ChannelA': { $exists: true } },
          { 'channels.ChannelB': { $exists: true } },
        ],
      })
    );
    params.append('export_scalars', 'true');
    params.append('export_images', 'false');
    params.append('export_waveform_csvs', 'false');
    params.append('export_waveform_images', 'false');

    expect(getSpy).toHaveBeenCalledWith('/export', {
      params,
      headers: {
        Authorization: 'Bearer null',
      },
      responseType: 'blob',
    });

    expect(mockLink.href).toEqual('testObjectUrl');
    expect(mockLink.download).toEqual('scdownload.csv');
    expect(mockLink.style.display).toEqual('none');

    expect(mockLinkClick).toHaveBeenCalled();
    expect(mockLinkRemove).toHaveBeenCalled();
  });

  it.todo(
    'sends request to export data and throws an appropriate error on failure'
  );
});
