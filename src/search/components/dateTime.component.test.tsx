import React from 'react';
import DateTime, {
  DateTimeSearchProps,
  datesEqual,
  verifyAndUpdateDate,
  type VerifyAndUpdateDateParams,
} from './dateTime.component';
import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../../setupTests';

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

describe('verifyAndUpdateDate function', () => {
  let props: VerifyAndUpdateDateParams;
  const changeDate = jest.fn();

  beforeEach(() => {
    props = {
      date: new Date('2022-01-01T00:00:00'),
      prevDate: null,
      otherDate: null,
      fromDateOrToDateChanged: 'fromDate',
      changeDate: changeDate,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls changeDate if otherDate is null', () => {
    verifyAndUpdateDate(props);

    expect(changeDate).toHaveBeenCalledWith(new Date('2022-01-01 00:00:00'));
  });

  it('calls changeDate if valid fromDate', () => {
    verifyAndUpdateDate({
      ...props,
      otherDate: new Date('2022-01-02T00:00:00'),
    });

    expect(changeDate).toHaveBeenCalledWith(new Date('2022-01-01 00:00:00'));
  });

  it('calls changeDate if valid toDate', () => {
    verifyAndUpdateDate({
      ...props,
      otherDate: new Date('2021-01-01T00:00:00'),
      fromDateOrToDateChanged: 'toDate',
    });

    expect(changeDate).toHaveBeenCalledWith(new Date('2022-01-01 00:00:00'));
  });

  it("doesn't call changeDate if dates are equal", () => {
    verifyAndUpdateDate({
      ...props,
      otherDate: new Date('2022-01-01T00:00:00'),
    });

    expect(changeDate).not.toHaveBeenCalled();
  });

  it("doesn't call changeDate if fromDate is invalid", () => {
    verifyAndUpdateDate({
      ...props,
      otherDate: new Date('2021-01-01T00:00:00'),
    });

    expect(changeDate).not.toHaveBeenCalled();
  });

  it("doesn't call changeDate if toDate is invalid", () => {
    verifyAndUpdateDate({
      ...props,
      otherDate: new Date('2022-01-02T00:00:00'),
      fromDateOrToDateChanged: 'toDate',
    });

    expect(changeDate).not.toHaveBeenCalled();
  });

  it("doesn't call changeDate if date hasn't changed based on prevDate", () => {
    verifyAndUpdateDate({
      ...props,
      prevDate: props.date,
    });

    expect(changeDate).not.toHaveBeenCalled();
  });
});

describe('DateTime tests', () => {
  let props: DateTimeSearchProps;
  const changeSearchParameterFromDate = jest.fn();
  const changeSearchParameterToDate = jest.fn();
  const resetTimeframe = jest.fn();

  const createView = (): RenderResult => {
    return render(<DateTime {...props} />);
  };

  beforeEach(() => {
    applyDatePickerWorkaround();
    userEvent.setup();
    props = {
      searchParameterFromDate: null,
      searchParameterToDate: null,
      changeSearchParameterFromDate,
      changeSearchParameterToDate,
      resetTimeframe,
    };
  });

  afterEach(() => {
    cleanupDatePickerWorkaround();
    jest.clearAllMocks();
  });

  it('renders correctly with no input date-time ranges', () => {
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly with input date-time ranges', () => {
    props.searchParameterFromDate = new Date('2021-01-01 00:00:00');
    props.searchParameterToDate = new Date('2021-01-02 00:00:00');

    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('calls changeDate and resetTimeframe when filling out and clearing date-time inputs', async () => {
    createView();

    const dateFilterFromDate = screen.getByLabelText('from, date-time input');
    await userEvent.type(dateFilterFromDate, '2022-01-01 00:00:00');
    expect(changeSearchParameterFromDate).toHaveBeenCalledWith(
      new Date('2022-01-01 00:00:00')
    );

    expect(resetTimeframe).toHaveBeenCalled();

    await userEvent.clear(dateFilterFromDate);
    expect(changeSearchParameterFromDate).toHaveBeenCalledWith(null);

    const dateFilterToDate = screen.getByLabelText('to, date-time input');
    await userEvent.type(dateFilterToDate, '2022-01-02 00:00:00');
    expect(changeSearchParameterToDate).toHaveBeenCalledWith(
      new Date('2022-01-02 00:00:00')
    );
    await userEvent.clear(dateFilterToDate);
    expect(changeSearchParameterToDate).toHaveBeenCalledWith(null);
  });

  it.todo('calls changeDate when opening calendar and selecting elements');

  it('displays helper text while typing date-time', async () => {
    createView();

    const dateFilterFromDate = screen.getByLabelText('from, date-time input');
    await userEvent.type(dateFilterFromDate, '2022-01-');
    expect(
      screen.getByText('Date-time format: yyyy-MM-dd HH:mm:ss')
    ).toBeInTheDocument();

    const dateFilterToDate = screen.getByLabelText('from, date-time input');
    await userEvent.type(dateFilterToDate, '2022-01-');
    expect(
      screen.getByText('Date-time format: yyyy-MM-dd HH:mm:ss')
    ).toBeInTheDocument();
  });

  it('handles invalid date-time values correctly by not calling changeDate and displaying helper text', async () => {
    createView();

    const dateFilterFromDate = screen.getByLabelText('from, date-time input');
    await userEvent.type(dateFilterFromDate, '2022-01-01 00:00:00');

    expect(changeSearchParameterFromDate).toHaveBeenLastCalledWith(
      new Date('2022-01-01 00:00:00')
    );

    const dateFilterToDate = screen.getByLabelText('to, date-time input');
    await userEvent.type(dateFilterToDate, '2021-01-01 00:00:00');

    const helperTexts = screen.getAllByText('Invalid date-time range');

    // One helper text below each input
    expect(helperTexts.length).toEqual(2);

    expect(changeSearchParameterToDate).not.toHaveBeenCalled();
  });
});
