import {
  act,
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { DEFAULT_WINDOW_VARS } from '../app.types';
import { operators, type Token } from '../filtering/filterParser';
import recordsJson from '../mocks/records.json';
import { server } from '../mocks/server';
import { deselectColumn, selectColumn } from '../state/slices/tableSlice';
import { RootState } from '../state/store';
import { getInitialState, renderComponentWithProviders } from '../testUtils';
import RecordTable, {
  extractChannelsFromTokens,
} from './recordTable.component';

describe('Record Table', () => {
  let state: RootState;
  const openFilters = vi.fn();

  let uuidCount = 0;

  const createView = (initialState = state) => {
    return renderComponentWithProviders(
      <RecordTable openFilters={openFilters} tableHeight="100px" />,
      {
        preloadedState: initialState,
      }
    );
  };

  beforeEach(() => {
    state = getInitialState();

    vi.spyOn(global.crypto, 'randomUUID').mockImplementation(
      // @ts-expect-error Format is intentionally different to uuid v4
      () => `${++uuidCount}`
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    const view = createView();

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'), {
      timeout: 5000,
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly while loading', () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly while data count is zero', async () => {
    server.use(
      http.get('/records', () => HttpResponse.json([], { status: 200 })),
      http.get('/records/count', () => HttpResponse.json(0, { status: 200 }))
    );

    const view = createView();

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'), {
      timeout: 5000,
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  describe('row selection', () => {
    it('can select all rows', async () => {
      const user = userEvent.setup();

      server.use(
        http.get('/records', () =>
          HttpResponse.json(recordsJson.slice(0, 3), { status: 200 })
        )
      );
      const { store } = createView({
        table: { ...state.table },
      });

      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'), {
        timeout: 5000,
      });

      expect(store.getState().selection.selectedRows).toEqual([]);

      await user.click(screen.getByLabelText('select all rows'));
      expect(store.getState().selection.selectedRows).toEqual(['1', '2', '3']);

      // Deselect all rows
      await user.click(screen.getByLabelText('select all rows'));
      expect(store.getState().selection.selectedRows).toEqual([]);
    });

    it('can select single and multiple rows', async () => {
      const user = userEvent.setup();
      server.use(
        http.get('/records', () =>
          HttpResponse.json(recordsJson, { status: 200 })
        )
      );
      const { store } = createView({
        table: { ...state.table },
      });
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'), {
        timeout: 5000,
      });

      expect(store.getState().selection.selectedRows).toEqual([]);

      await user.click(screen.getAllByLabelText('select row')[0]);
      expect(store.getState().selection.selectedRows).toEqual(['1']);

      await user.click(screen.getAllByLabelText('select row')[1]);
      expect(store.getState().selection.selectedRows).toEqual(['1', '2']);

      // Deselect a row
      await user.click(screen.getAllByLabelText('select row')[0]);
      expect(store.getState().selection.selectedRows).toEqual(['2']);
    });
  });

  it('can sort columns and removes column sort when column is closed', async () => {
    const user = userEvent.setup();
    const { store } = createView({
      table: { ...state.table, selectedColumnIds: ['timestamp', 'shotnum'] },
    });

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'), {
      timeout: 5000,
    });

    await user.click(screen.getByTestId('sort shotnum'));

    expect(screen.getByTestId('sort shotnum')).toHaveClass('Mui-active');

    const menuIcon = screen.getByLabelText('shotnum menu');
    fireEvent.click(menuIcon);

    const close = screen.getByText('Close');
    fireEvent.click(close);

    await waitFor(() => {
      expect(screen.queryByTestId('sort shotnum')).not.toBeInTheDocument();
    });

    await act(async () => {
      store.dispatch(selectColumn('shotnum'));
    });

    expect(screen.getByTestId('sort shotnum')).not.toHaveClass('Mui-active');
  });

  it('paginates correctly', async () => {
    state = { ...state, table: { ...state.table, resultsPerPage: 10 } };
    const user = userEvent.setup();
    createView();

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'), {
      timeout: 5000,
    });

    screen.getByText(`1–10 of ${recordsJson.length}`);

    await user.click(screen.getByLabelText('Go to next page'));

    screen.getByText(`11–${recordsJson.length} of ${recordsJson.length}`);

    const resultsPerPage = screen.getByRole('combobox', {
      name: 'Rows per page:',
    });
    await user.click(resultsPerPage);

    const listbox = within(screen.getByRole('listbox'));

    await user.click(listbox.getByText('25'));

    screen.getByText(`1–${recordsJson.length} of ${recordsJson.length}`);
  });

  it('adds columns in correct order on checkbox click', async () => {
    const { store } = createView();

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'), {
      timeout: 5000,
    });

    act(() => {
      store.dispatch(selectColumn('shotnum'));
      store.dispatch(selectColumn('activeArea'));
      store.dispatch(selectColumn('activeExperiment'));
    });

    let columns = screen.getAllByRole('columnheader');

    await waitFor(() => {
      columns = screen.getAllByRole('columnheader');
      expect(columns.length).toEqual(5);
    });

    expect(columns[1]).toHaveTextContent('Time');
    expect(columns[2]).toHaveTextContent('Shot Number');
    expect(columns[3]).toHaveTextContent('Active Area');
    expect(columns[4]).toHaveTextContent('Active Experiment');

    // Remove middle column
    act(() => {
      store.dispatch(deselectColumn('activeArea'));
    });

    await waitFor(() => {
      columns = screen.getAllByRole('columnheader');
      expect(columns.length).toEqual(4);
    });
    expect(columns[1]).toHaveTextContent('Time');
    expect(columns[2]).toHaveTextContent('Shot Number');
    expect(columns[3]).toHaveTextContent('Active Experiment');

    act(() => {
      store.dispatch(selectColumn('activeArea'));
    });

    // Should expect the column previously in the middle to now be on the end
    await waitFor(() => {
      columns = screen.getAllByRole('columnheader');
      expect(columns.length).toEqual(5);
    });
    expect(columns[1]).toHaveTextContent('Time');
    expect(columns[2]).toHaveTextContent('Shot Number');
    expect(columns[3]).toHaveTextContent('Active Experiment');
    expect(columns[4]).toHaveTextContent('Active Area');
  });

  it('rounds numbers correctly in scalar columns', async () => {
    const recordToModifyIndex = recordsJson.findIndex(
      (record) => 'CHANNEL_DEFGH' in record.channels
    )!;
    const modifiedRecord = { ...recordsJson[recordToModifyIndex] };

    modifiedRecord.channels.CHANNEL_DEFGH!.data = 333.3;
    const modifiedRecords = [
      ...recordsJson.slice(0, recordToModifyIndex),
      modifiedRecord,
      ...recordsJson.slice(recordToModifyIndex + 1),
    ];
    server.use(
      http.get('/records', () =>
        HttpResponse.json(modifiedRecords, { status: 200 })
      )
    );

    createView({
      table: {
        ...state.table,
        selectedColumnIds: ['timestamp', 'CHANNEL_DEFGH'],
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'), {
      timeout: 5000,
    });

    expect(screen.getByText('3.3e+2')).toBeInTheDocument();
  });

  it("updates columns when a column's word wrap is toggled", async () => {
    createView();

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'), {
      timeout: 5000,
    });

    let menuIcon = screen.getByLabelText('timestamp menu');
    fireEvent.click(menuIcon);

    expect(screen.getByText('Turn word wrap on')).toBeInTheDocument();

    const wordWrap = screen.getByText('Turn word wrap on');
    fireEvent.click(wordWrap);

    menuIcon = screen.getByLabelText('timestamp menu');
    fireEvent.click(menuIcon);

    expect(screen.getByText('Turn word wrap off')).toBeInTheDocument();
  });

  it('opens trace window when a trace is clicked', async () => {
    const user = userEvent.setup();
    const { store } = createView();

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'), {
      timeout: 5000,
    });

    act(() => {
      // CHANNEL_CDEFG is a waveform channel
      store.dispatch(selectColumn('CHANNEL_CDEFG'));
    });

    await user.click(
      (
        await screen.findAllByAltText('Channel_CDEFG waveform', {
          exact: false,
        })
      )[0]
    );

    expect(store.getState().windows).toEqual({
      [uuidCount]: {
        id: `${uuidCount}`,
        open: true,
        type: 'trace',
        recordId: '7',
        channelName: 'CHANNEL_CDEFG',
        title: 'Trace CHANNEL_CDEFG 7',
        ...DEFAULT_WINDOW_VARS,
      },
    });
  });

  it.todo('updates available columns when data from backend changes');
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
