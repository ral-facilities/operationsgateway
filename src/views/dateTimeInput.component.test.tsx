import React from 'react';
import DateTimeInputBox, {
  DateTimeFilter,
  DateTimeFilterProps,
  datesEqual,
  updateFilter,
  UpdateFilterParams,
} from './dateTimeInput.component';
import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
  getInitialState,
  renderWithStore,
} from '../setupTests';
import { PreloadedState } from '@reduxjs/toolkit';
import { RootState } from '../state/store';

describe('datesEqual function', () => {
  it('returns true if both dates are null', () => {
    const date1 = null;
    const date2 = null;
    expect(datesEqual(date1, date2)).toBe(true);
  });

  it('returns true if both dates are Invalid Date', () => {
    const date1 = new Date('');
    const date2 = new Date('');
    expect(datesEqual(date1, date2)).toBe(true);
  });

  it('returns true if one date is invalid and the other is null', () => {
    const date1 = null;
    const date2 = new Date('');
    expect(datesEqual(date1, date2)).toBe(true);
  });

  it('returns true if dates are the same date', () => {
    const date1 = new Date('2019-09-18');
    const date2 = new Date('2019-09-18');
    expect(datesEqual(date1, date2)).toBe(true);
  });

  it('returns false if dates are not the same date', () => {
    const date1 = new Date('2019-09-18');
    const date2 = new Date('2019-09-19');
    expect(datesEqual(date1, date2)).toBe(false);
  });

  it('returns false if one date is invalid and the other is valid', () => {
    const date1 = new Date('2019-09-18');
    const date2 = new Date('');
    expect(datesEqual(date1, date2)).toBe(false);
  });

  it('returns false if one date is null and the other is valid', () => {
    const date1 = null;
    const date2 = new Date('2019-09-18');
    expect(datesEqual(date1, date2)).toBe(false);
  });
});

describe('updateFilter function', () => {
  let props: UpdateFilterParams;
  const onChange = jest.fn();

  beforeEach(() => {
    props = {
      date: new Date('2022-01-01T00:00:00Z'),
      prevDate: null,
      otherDate: null,
      fromDateOrToDateChanged: 'fromDate',
      onChange: onChange,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls onChange if otherDate is null', () => {
    updateFilter(props);

    expect(onChange).toHaveBeenCalledWith('fromDate', '2022-01-01 00:00:00');
  });

  it('calls onChange if valid fromDate', () => {
    updateFilter({
      ...props,
      otherDate: new Date('2022-01-02T00:00:00Z'),
    });

    expect(onChange).toHaveBeenCalledWith('fromDate', '2022-01-01 00:00:00');
  });

  it('calls onChange if valid toDate', () => {
    updateFilter({
      ...props,
      otherDate: new Date('2021-01-01T00:00:00Z'),
      fromDateOrToDateChanged: 'toDate',
    });

    expect(onChange).toHaveBeenCalledWith('toDate', '2022-01-01 00:00:00');
  });

  it("doesn't call onChange if dates are equal", () => {
    updateFilter({
      ...props,
      otherDate: new Date('2022-01-01T00:00:00Z'),
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("doesn't call onChange if fromDate is invalid", () => {
    updateFilter({
      ...props,
      otherDate: new Date('2021-01-01T00:00:00Z'),
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("doesn't call onChange if toDate is invalid", () => {
    updateFilter({
      ...props,
      otherDate: new Date('2022-01-02T00:00:00Z'),
      fromDateOrToDateChanged: 'toDate',
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("doesn't call onChange if date hasn't changed based on prevDate", () => {
    updateFilter({
      ...props,
      prevDate: props.date,
    });

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('DateTimeFilter tests', () => {
  let props: DateTimeFilterProps;
  const onChange = jest.fn();

  const createView = (): RenderResult => {
    return render(<DateTimeFilter {...props} />);
  };

  beforeEach(() => {
    applyDatePickerWorkaround();
    userEvent.setup();
    props = {
      onChange: onChange,
    };
  });

  afterEach(() => {
    cleanupDatePickerWorkaround();
    jest.clearAllMocks();
  });

  it('renders date filter correctly', () => {
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('pre-fills dates if specified', () => {
    props = {
      ...props,
      receivedFromDate: '2022-01-01 00:00:00',
      receivedToDate: '2022-01-02 00:00:00',
    };
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('calls onChange when filling out date-time inputs', async () => {
    createView();

    const dateFilterFromDate = screen.getByLabelText('from, date-time input');
    await userEvent.type(dateFilterFromDate, '2022-01-01 00:00:00');

    expect(onChange).toHaveBeenCalledWith('fromDate', '2022-01-01 00:00:00');
  });

  it('calls onChange if a previous value is cleared', async () => {
    createView();

    const dateFilterFromDate = screen.getByLabelText('from, date-time input');
    await userEvent.type(dateFilterFromDate, '2022-01-01 00:00:00');
    await userEvent.clear(dateFilterFromDate);

    expect(onChange).toHaveBeenLastCalledWith('fromDate');
  });

  it.skip('calls onChange when opening calendar and selecting elements', async () => {
    createView();

    const dateFilterFromDate = screen.getByLabelText('from, date-time input');
    await userEvent.type(dateFilterFromDate, '2022-01-01 00:00:00');

    const dateFilterToDate = screen.getByLabelText('to, date-time picker');
    await userEvent.click(dateFilterToDate);

    const secondDay = screen.getByLabelText('Jan 2, 2022');
    await userEvent.click(secondDay);

    const firstHour = screen.getByLabelText('1 hours');
    await userEvent.click(firstHour);

    const fiveMins = screen.getByLabelText('05 minutes');
    await userEvent.click(fiveMins);

    const fiveSeconds = screen.getByLabelText('05 seconds');
    await userEvent.click(fiveSeconds);

    expect(onChange).toHaveBeenCalledWith('toDate', '2022-01-02 01:05:05');
  });

  it('displays helper text while typing date-time', async () => {
    createView();

    const dateFilterFromDate = screen.getByLabelText('from, date-time input');
    await userEvent.type(dateFilterFromDate, '2022-01-');

    screen.getByText('Date-time format: yyyy-MM-dd HH:mm:ss');
  });

  it('handles invalid date-time values correctly by not calling onChange and displaying helper text', async () => {
    createView();

    const dateFilterFromDate = screen.getByLabelText('from, date-time input');
    await userEvent.type(dateFilterFromDate, '2022-01-01 00:00:00');

    expect(onChange).toHaveBeenLastCalledWith(
      'fromDate',
      '2022-01-01 00:00:00'
    );
    expect(onChange.mock.calls.length).toEqual(1);

    const dateFilterToDate = screen.getByLabelText('to, date-time input');
    await userEvent.type(dateFilterToDate, '2021-01-01 00:00:00');

    const helperTexts = screen.getAllByText('Invalid date-time range');

    // One helper text below each input
    expect(helperTexts.length).toEqual(2);

    expect(onChange).toHaveBeenLastCalledWith(
      'fromDate',
      '2022-01-01 00:00:00'
    );
    expect(onChange.mock.calls.length).toEqual(1);
  });
});

describe('DateTimeInputBox tests', () => {
  let state: PreloadedState<RootState>;

  const createView = (initialState = state) => {
    return renderWithStore(<DateTimeInputBox />, {
      preloadedState: initialState,
    });
  };

  beforeEach(() => {
    state = { ...getInitialState(), search: { ...getInitialState().search } };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with no input date-time ranges', () => {
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly with input date-time ranges', () => {
    state.search.dateRange = {
      fromDate: '2021-01-01 00:00:00',
      toDate: '2021-01-02 00:00:00',
    };

    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('updates start/end date fields on date-time change', async () => {
    const { store } = createView();

    const dateFilterFromDate = screen.getByLabelText('from, date-time input');
    await userEvent.type(dateFilterFromDate, '2022-01-01 00:00:00');

    expect(store.getState().search.dateRange.fromDate).toEqual(
      '2022-01-01 00:00:00'
    );

    const dateFilterToDate = screen.getByLabelText('to, date-time input');
    await userEvent.type(dateFilterToDate, '2022-01-02 00:00:00');

    expect(store.getState().search.dateRange.toDate).toEqual(
      '2022-01-02 00:00:00'
    );
  });
});
