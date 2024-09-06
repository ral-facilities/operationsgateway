import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { format } from 'date-fns';
import { testScalarChannels } from '../../testUtils';
import type { XAxisTabProps } from './xAxisTab.component';
import XAxisTab from './xAxisTab.component';

describe('x-axis tab', () => {
  let props: XAxisTabProps;
  let user;
  const changeXAxis = vi.fn();
  const changeXAxisScale = vi.fn();
  const changeXMinimum = vi.fn();
  const changeXMaximum = vi.fn();

  const createView = (): RenderResult => {
    return render(<XAxisTab {...props} />);
  };

  beforeEach(() => {
    props = {
      allChannels: testScalarChannels,
      XAxisScale: 'linear',
      XAxis: '',
      changeXAxis,
      changeXAxisScale,
      changeXMinimum,
      changeXMaximum,
    };

    user = userEvent.setup({ delay: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with arbitrary x axis', () => {
    props.XAxis = 'CHANNEL_ABCDE';
    const { asFragment } = createView();

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with timestamp x axis', () => {
    props.XAxisScale = 'time';
    props.XAxis = 'timestamp';
    const { asFragment } = createView();

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders X scale radio buttons and calls changeXAxisScale on click', async () => {
    createView();

    const radioGroup = screen.getByRole('radiogroup', { name: 'Scale' });
    expect(
      within(radioGroup).getByRole('radio', {
        name: 'Linear',
      })
    ).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Log' }));

    expect(changeXAxisScale).toHaveBeenCalledWith('logarithmic');
  });

  it('allows user to select an x-axis (keyboard only)', async () => {
    createView();

    const autocomplete = screen.getByTestId('x-axis-autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'Channel_');
    autocomplete.focus();
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    expect(changeXAxis).toHaveBeenCalledWith('CHANNEL_ABCDE');
    expect(changeXAxisScale).toHaveBeenCalledWith('linear');
  });

  it('allows user to select an x-axis (mouse and keyboard)', async () => {
    createView();

    const autocomplete = screen.getByTestId('x-axis-autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'Channel_');
    await user.click(screen.getByText('Channel_DEFGH'));

    expect(changeXAxis).toHaveBeenCalledWith('CHANNEL_DEFGH');
    expect(changeXAxisScale).toHaveBeenCalledWith('linear');
  });

  it('prevents user from selecting time in xy mode', async () => {
    createView();

    const autocomplete = screen.getByTestId('x-axis-autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'time');
    // i.e. there's no suggestions in the autocomplete
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('removes x-axis from display when we click Close on its label', async () => {
    props.XAxis = 'CHANNEL_ABCDE';
    createView();

    await user.click(screen.getByLabelText('Remove Channel_ABCDE from x-axis'));
    expect(changeXAxis).toHaveBeenLastCalledWith(undefined);
    expect(changeXAxisScale).toHaveBeenCalledWith('linear');
  });

  describe('min and max fields', () => {
    describe('numeric values', () => {
      it('lets user change the min field and calls relevant onchange method', async () => {
        createView();

        const minField = screen.getByLabelText('Min');
        await user.type(minField, '0');
        expect(changeXMinimum).toHaveBeenCalledWith(0);
      });

      it('lets user change the max field and calls relevant onchange method', async () => {
        createView();

        const maxField = screen.getByLabelText('Max');
        await user.type(maxField, '0');
        expect(changeXMaximum).toHaveBeenCalledWith(0);
      });

      it('sets minimum value to undefined if no float value is present', async () => {
        createView();

        const minField = screen.getByLabelText('Min');
        await user.type(minField, '1');
        expect(changeXMinimum).toHaveBeenLastCalledWith(1);

        await user.clear(minField);
        expect(changeXMinimum).toHaveBeenLastCalledWith(undefined);
      });

      it('sets maximum value to undefined if no float value is present', async () => {
        createView();

        const maxField = screen.getByLabelText('Max');
        await user.type(maxField, '1');
        expect(changeXMaximum).toHaveBeenLastCalledWith(1);

        await user.clear(maxField);
        expect(changeXMaximum).toHaveBeenLastCalledWith(undefined);
      });

      it('displays helper text when min and max fields contain an invalid range', async () => {
        createView();

        const minField = screen.getByLabelText('Min');
        const maxField = screen.getByLabelText('Max');
        await user.type(minField, '2');
        await user.type(maxField, '1');

        // Check the helper text displays
        screen.getAllByText('Invalid range');

        // One for each input box
        expect(screen.getAllByText('Invalid range').length).toEqual(2);
      });

      it('initialises correctly with falsy values', async () => {
        props.initialXMinimum = 0;
        props.initialXMaximum = 0;
        createView();

        const minField = screen.getByLabelText('Min');
        expect(minField).toHaveValue('0');

        const maxField = screen.getByLabelText('Max');
        expect(maxField).toHaveValue('0');
      });
    });

    describe('date-time values', () => {
      beforeEach(() => {
        props.XAxis = 'timestamp';
        props.XAxisScale = 'time';
      });

      it('lets user change the fromDate field and calls relevant onchange method', async () => {
        createView();

        const selectedDate = new Date('2022-01-01 00:00:00');
        const dateFilterFromDate = screen.getByLabelText(
          'from, date-time input'
        );
        await userEvent.type(
          dateFilterFromDate,
          format(selectedDate, 'yyyy-MM-dd HH:mm')
        );
        expect(changeXMinimum).toHaveBeenCalledWith(selectedDate.getTime());
      });

      it('lets user change the toDate field and calls relevant onchange method', async () => {
        createView();

        const selectedDate = new Date('2022-01-01 00:00:59');
        const dateFilterToDate = screen.getByLabelText('to, date-time input');
        await userEvent.type(
          dateFilterToDate,
          format(selectedDate, 'yyyy-MM-dd HH:mm')
        );
        expect(changeXMaximum).toHaveBeenCalledWith(selectedDate.getTime());
      });

      it('changes to and from dateTimes to use 0 seconds and 59 seconds respectively', async () => {
        createView();
        const selectedFromDate = new Date('2022-01-01 00:0:00');
        const selectedToDate = new Date('2022-01-01 00:00:00');
        const expectedSelectedFromDate = new Date('2022-01-01 00:00:00');
        const expectedSelectedToDate = new Date('2022-01-01 00:00:59');

        const dateFilterFromDate = screen.getByLabelText(
          'from, date-time input'
        );
        const dateFilterToDate = screen.getByLabelText('to, date-time input');
        await userEvent.type(
          dateFilterFromDate,
          format(selectedFromDate, 'yyyy-MM-dd HH:mm')
        );
        await userEvent.type(
          dateFilterToDate,
          format(selectedToDate, 'yyyy-MM-dd HH:mm')
        );

        expect(changeXMaximum).toHaveBeenCalledWith(
          expectedSelectedToDate.getTime()
        );
        expect(changeXMinimum).toHaveBeenCalledWith(
          expectedSelectedFromDate.getTime()
        );
      });

      it('displays helper text when fromDate and toDate fields contain an invalid range', async () => {
        createView();

        const selectedFromDate = new Date('2022-01-02 00:00:00');
        const selectedToDate = new Date('2022-01-01 00:00:00');

        const dateFilterFromDate = screen.getByLabelText(
          'from, date-time input'
        );
        const dateFilterToDate = screen.getByLabelText('to, date-time input');
        await userEvent.type(
          dateFilterFromDate,
          format(selectedFromDate, 'yyyy-MM-dd HH:mm')
        );
        await userEvent.type(
          dateFilterToDate,
          format(selectedToDate, 'yyyy-MM-dd HH:mm')
        );

        // Check the helper text displays
        screen.getAllByText('Invalid date-time range');

        // One for each input box
        expect(screen.getAllByText('Invalid date-time range').length).toEqual(
          2
        );
      });

      it('initialises correctly with falsy values', async () => {
        props.initialXMinimum = 0;
        props.initialXMaximum = 0;
        createView();

        const expectedDate = new Date(0);
        const expectedString = format(expectedDate, 'yyyy-MM-dd HH:mm');

        const minField = screen.getByLabelText('from, date-time input');
        expect(minField).toHaveValue(expectedString);

        const maxField = screen.getByLabelText('to, date-time input');
        expect(maxField).toHaveValue(expectedString);
      });
    });
  });
});
