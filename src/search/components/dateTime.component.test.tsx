import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExperimentParams } from '../../app.types';
import experimentsJSON from '../../mocks/experiments.json';
import DateTime, {
  CustomPickersDay,
  datesEqual,
  DateTimeSearchProps,
  renderExperimentPickerDay,
  verifyAndUpdateDate,
  type VerifyAndUpdateDateParams,
} from './dateTime.component';

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

describe('CustomPickersDay function', () => {
  it('renders the CustomPickerDay correctly', () => {
    const dayIsBetween = true;
    const isFirstDay = true;
    const isLastDay = true;
    const pickersDayProps: PickersDayProps<Date> = {
      day: new Date('2022-02-05T00:00:00'),
      isAnimating: false,
      disabled: false,
      autoFocus: false,
      today: false,
      outsideCurrentMonth: true,
      selected: false,
      disableHighlightToday: undefined,
      showDaysOutsideCurrentMonth: undefined,
      isLastVisibleCell: false,
      isFirstVisibleCell: false,
      onDaySelect: vi.fn(),
      onBlur: vi.fn(),
      onFocus: vi.fn(),
      onKeyDown: vi.fn(),
    };
    const createView = (): RenderResult => {
      return render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CustomPickersDay
            {...pickersDayProps}
            dayIsBetween={dayIsBetween}
            isFirstDay={isFirstDay}
            isLastDay={isLastDay}
          />
        </LocalizationProvider>
      );
    };

    const view = createView();

    expect(view.baseElement).toMatchSnapshot();
  });
});
describe('renderExperimentPickerDay function', () => {
  let selectedDate: Date | null;
  let experiments: ExperimentParams[];
  const isDateTimeInExperiment = (dateTime, experiment) => {
    return (
      new Date(dateTime) >= new Date(experiment.start_date) &&
      new Date(dateTime) <= new Date(experiment.end_date)
    );
  };
  let date: Date;
  let pickersDayProps: PickersDayProps<Date>;

  beforeEach(() => {
    selectedDate = null;
    experiments = experimentsJSON;
    date = new Date('2022-02-05T00:00:00');
    pickersDayProps = {
      day: date,
      isAnimating: false,
      disabled: false,
      autoFocus: false,
      today: false,
      outsideCurrentMonth: true,
      isFirstVisibleCell: false,
      isLastVisibleCell: false,
      selected: false,
      disableHighlightToday: undefined,
      showDaysOutsideCurrentMonth: undefined,
      onDaySelect: vi.fn(),
      onBlur: vi.fn(),
      onFocus: vi.fn(),
      onKeyDown: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders a PickersDay component when selectedDate is with an experiment', () => {
    selectedDate = new Date('2022-01-03T13:00:00');

    const view = renderExperimentPickerDay(
      selectedDate,
      experiments,
      isDateTimeInExperiment,
      pickersDayProps
    );

    expect(view).toMatchSnapshot();
  });

  it('renders a PickersDay component when selectedDate is not with an experiment', () => {
    selectedDate = new Date('2023-01-03T13:00:00');
    const view = renderExperimentPickerDay(
      selectedDate,
      experiments,
      isDateTimeInExperiment,
      pickersDayProps
    );

    expect(view).toMatchSnapshot();
  });

  it('renders a PickersDay component when selectedDate is null', () => {
    const view = renderExperimentPickerDay(
      selectedDate,
      experiments,
      isDateTimeInExperiment,
      pickersDayProps
    );

    expect(view).toMatchSnapshot();
  });
});

describe('verifyAndUpdateDate function', () => {
  let props: VerifyAndUpdateDateParams;
  const changeDate = vi.fn();

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
    vi.clearAllMocks();
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

  it('allows changeDate to be called if both dates are equal', () => {
    verifyAndUpdateDate({
      ...props,
      otherDate: new Date('2022-01-01T00:00:00'),
    });

    expect(changeDate).toHaveBeenCalledWith(new Date('2022-01-01T00:00:00'));
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
  const changeSearchParameterFromDate = vi.fn();
  const changeSearchParameterToDate = vi.fn();
  const resetTimeframe = vi.fn();
  const resetExperimentTimeframe = vi.fn();
  const resetShotnumberRange = vi.fn();
  const isDateTimeInExperiment = vi.fn();
  const searchParamsUpdated = vi.fn();
  const setDatePickerError = vi.fn();

  const createView = (): RenderResult => {
    return render(<DateTime {...props} />);
  };

  beforeEach(() => {
    userEvent.setup();
    props = {
      searchParameterFromDate: null,
      searchParameterToDate: null,
      changeSearchParameterFromDate,
      changeSearchParameterToDate,
      resetTimeframe,
      timeframeRange: null,
      resetExperimentTimeframe,
      searchParameterExperiment: null,
      experiments: [],
      resetShotnumberRange,
      isShotnumToDate: false,
      isDateTimeInExperiment,
      invalidDateRange: false,
      searchParamsUpdated,
      setDatePickerError,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
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

  it('calls changeDate and resetTimeframe and resetExperimentTimeframe when filling out and clearing date-time inputs', async () => {
    const experiments = [
      {
        _id: '17210011-1',
        end_date: '2019-01-20T18:00:00',
        experiment_id: '17210011',
        part: 1,
        start_date: '2019-01-07T10:00:00',
      },
      {
        _id: '18110022-1',
        end_date: '2019-05-21T16:48:00',
        experiment_id: '18110022',
        part: 1,
        start_date: '2019-04-08T09:00:00',
      },
      {
        _id: '18110023-1',
        end_date: '2019-02-12T17:48:00',
        experiment_id: '18110023',
        part: 1,
        start_date: '2019-01-21T10:00:00',
      },
    ];
    props.experiments = experiments;
    props.searchParameterExperiment = experiments[0];

    createView();

    const dateFilterFromDate = screen.getByLabelText('from, date-time input');
    await userEvent.type(dateFilterFromDate, '2022-01-01 00:00:00');
    expect(changeSearchParameterFromDate).toHaveBeenCalledWith(
      new Date('2022-01-01 00:00:00')
    );

    const dateFilterToDate = screen.getByLabelText('to, date-time input');
    await userEvent.type(dateFilterToDate, '2022-01-02 00:00:00');
    expect(changeSearchParameterToDate).toHaveBeenCalledWith(
      new Date('2022-01-02 00:00:00')
    );

    expect(resetTimeframe).toHaveBeenCalled();
    expect(resetExperimentTimeframe).toHaveBeenCalled();
    expect(resetShotnumberRange).toHaveBeenCalled();
    expect(searchParamsUpdated).toHaveBeenCalled();

    await userEvent.clear(dateFilterFromDate);
    expect(changeSearchParameterFromDate).toHaveBeenCalledWith(null);

    await userEvent.clear(dateFilterToDate);
    expect(changeSearchParameterToDate).toHaveBeenCalledWith(null);
  });

  it('calls changeDate and resetTimeframe and setExperimentTimeframe when filling out and clearing date-time inputs', async () => {
    const experiments = [
      {
        _id: '17210011-1',
        end_date: '2019-01-20T18:00:00',
        experiment_id: '17210011',
        part: 1,
        start_date: '2019-01-07T10:00:00',
      },
      {
        _id: '18110022-1',
        end_date: '2019-05-21T16:48:00',
        experiment_id: '18110022',
        part: 1,
        start_date: '2019-04-08T09:00:00',
      },
      {
        _id: '18110023-1',
        end_date: '2019-02-12T17:48:00',
        experiment_id: '18110023',
        part: 1,
        start_date: '2019-01-21T10:00:00',
      },
    ];
    props.experiments = experiments;
    props.searchParameterExperiment = experiments[0];

    createView();

    const dateFilterFromDate = screen.getByLabelText('from, date-time input');
    await userEvent.type(dateFilterFromDate, '2019-01-07_11:00:00');
    expect(changeSearchParameterFromDate).toHaveBeenCalledWith(
      new Date('2019-01-07 11:00:00')
    );

    const dateFilterToDate = screen.getByLabelText('to, date-time input');
    await userEvent.type(dateFilterToDate, '2019-01-20_17:00:00');
    expect(changeSearchParameterToDate).toHaveBeenCalledWith(
      new Date('2019-01-20 17:00:00')
    );

    expect(resetTimeframe).toHaveBeenCalled();
    expect(resetShotnumberRange).toHaveBeenCalled();
    expect(searchParamsUpdated).toHaveBeenCalled();

    await userEvent.clear(dateFilterFromDate);
    expect(changeSearchParameterFromDate).toHaveBeenCalledWith(null);

    await userEvent.clear(dateFilterToDate);
    expect(changeSearchParameterToDate).toHaveBeenCalledWith(null);
  });

  it.todo('calls changeDate when opening calendar and selecting elements');

  it('displays helper text while typing date-time (to date)', async () => {
    createView();

    const dateFilterToDate = screen.getByLabelText('to, date-time input');
    await userEvent.type(dateFilterToDate, '2022-01-');
    expect(screen.getByText('Format: yyyy-MM-dd HH:mm')).toBeInTheDocument();
  });

  it('displays helper text while typing date-time (from date)', async () => {
    createView();

    const dateFilterFromDate = screen.getByLabelText('from, date-time input');
    await userEvent.type(dateFilterFromDate, '2022-01-');
    expect(screen.getByText('Format: yyyy-MM-dd HH:mm')).toBeInTheDocument();
  });

  it('handles invalid date-time values correctly by calling setDatePickerError and displaying helper text', async () => {
    props = { ...props, invalidDateRange: true };
    createView();

    const helperTexts = screen.getAllByText('Invalid date-time range');
    expect(setDatePickerError).toHaveBeenCalled();

    // One helper text below each input
    expect(helperTexts.length).toEqual(2);
  });
});
