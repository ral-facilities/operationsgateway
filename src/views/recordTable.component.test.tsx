import React from 'react';
import {
  render,
  RenderResult,
  screen,
  act,
  fireEvent,
} from '@testing-library/react';
import RecordTable, { RecordTableProps } from './recordTable.component';
import { testRecords, flushPromises } from '../setupTests';
import { useRecordCount, useRecordsPaginated } from '../api/records';
import { Record } from '../app.types';

jest.mock('../api/records', () => {
  const originalModule = jest.requireActual('../api/records');

  return {
    __esModule: true,
    ...originalModule,
    useRecordsPaginated: jest.fn(),
    useRecordCount: jest.fn(),
  };
});

describe('Record Table', () => {
  let data;
  let props: RecordTableProps;

  const createView = (): RenderResult => {
    return render(<RecordTable {...props} />);
  };

  beforeEach(() => {
    data = testRecords;
    props = {
      resultsPerPage: 10,
    };

    (useRecordsPaginated as jest.Mock).mockReturnValue({
      data: data,
      isLoading: false,
    });
    (useRecordCount as jest.Mock).mockReturnValue({
      data: data.length,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with no displayed columns', () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly with columns displayed', async () => {
    let columns: Set<string> = new Set<string>(['id', 'shotNum', 'timestamp']);

    // Fetch all displayed column names
    for (let i = 0; i < data.length; i++) {
      const record: Record = data[i];
      const keys = Object.keys(record.channels);
      keys.forEach((key: string) => {
        columns.add(key);
      });
    }

    const view = createView();

    // Query for each column
    for (let column of columns) {
      await act(async () => {
        screen.getByLabelText(column).click();
        await flushPromises();
      });
    }

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('calls the correct data fetching hooks on load', () => {
    createView();

    expect(useRecordsPaginated).toHaveBeenCalledWith({
      page: 0,
      sort: {},
    });
    expect(useRecordCount).toHaveBeenCalled();
  });

  it('updates page query parameter on page change', async () => {
    props.resultsPerPage = 1;
    createView();

    await act(async () => {
      screen.getByLabelText('Go to next page').click();
      await flushPromises();
    });

    expect(useRecordsPaginated).toHaveBeenLastCalledWith({
      page: 1,
      sort: {},
    });
  });

  it('updates sort query parameter on sort', async () => {
    createView();

    await act(async () => {
      screen.getByLabelText('id checkbox').click();
      await flushPromises();
      screen.getByTestId('sort id').click();
      await flushPromises();
    });

    expect(useRecordsPaginated).toHaveBeenLastCalledWith({
      page: 0,
      sort: {
        id: 'asc',
      },
    });
  });

  it('amends displayed columns on checkbox interaction', async () => {
    createView();

    await act(async () => {
      screen.getByLabelText('id').click();
      await flushPromises();
    });

    // Current rudimentary way to fetch the ID data header and not the ID checkbox
    // The existence of this is used to "prove" that the ID column is on the screen
    // Could do with some improving
    let idColumn = screen.getAllByRole('button').find((element) => {
      return element.textContent === 'id';
    });

    expect(idColumn).not.toBeUndefined();

    await act(async () => {
      screen.getByLabelText('id').click();
      await flushPromises();
    });
    idColumn = screen.getAllByRole('button').find((element) => {
      return element.textContent === 'id';
    });
    expect(idColumn).toBeUndefined();
  });

  it('amends displayed columns when column close button is clicked', async () => {
    createView();

    await act(async () => {
      screen.getByLabelText('id').click();
      await flushPromises();
    });

    // Current rudimentary way to fetch the ID data header and not the ID checkbox
    // The existence of this is used to "prove" that the ID column is on the screen
    // Could do with some improving
    let idColumn = screen.getAllByRole('button').find((element) => {
      return element.textContent === 'id';
    });

    expect(idColumn).not.toBeUndefined();

    const icon = screen.getByLabelText('close id');

    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.click(icon.firstChild);

    idColumn = screen.getAllByRole('button').find((element) => {
      return element.textContent === 'id';
    });
    expect(idColumn).toBeUndefined();
  });
});
