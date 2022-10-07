import React from 'react';
import XAxisTab from './xAxisTab.component';
import type { XAxisTabProps } from './xAxisTab.component';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
  testChannels,
} from '../../setupTests';
import { format } from 'date-fns';
import { FullScalarChannelMetadata } from '../../app.types';

describe('x-axis tab', () => {
  let props: XAxisTabProps;
  let user;
  const changeXAxis = jest.fn();
  const changeXAxisScale = jest.fn();
  const changeXMinimum = jest.fn();
  const changeXMaximum = jest.fn();

  const createView = (): RenderResult => {
    return render(<XAxisTab {...props} />);
  };

  beforeEach(() => {
    props = {
      allChannels: testChannels as FullScalarChannelMetadata[],
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
    jest.clearAllMocks();
  });

  it('renders correctly with min and max fields', () => {
    const { asFragment } = createView();

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with from date and to date fields', () => {
    props.XAxisScale = 'time';
    props.XAxis = 'timestamp';
    const { asFragment } = createView();

    expect(asFragment()).toMatchSnapshot();
  });

  it('does not let the user change the X axis scale if time is selected as the X axis', async () => {
    props.XAxis = 'timestamp';
    props.XAxisScale = 'time';
    createView();

    const radioGroup = screen.getByRole('radiogroup', { name: 'Scale' });
    const radioButtons = within(radioGroup).getAllByRole('radio');
    radioButtons.forEach((radioButton) => {
      expect(radioButton).toBeDisabled();
    });
  });

  it('switches the min and max number fields for date range fields if time is selected as the X axis', () => {
    props.XAxis = 'timestamp';
    props.XAxisScale = 'time';
    createView();

    expect(screen.getByLabelText('from, date-time input')).toBeInTheDocument();
    expect(screen.getByLabelText('to, date-time input')).toBeInTheDocument();
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

    const autocomplete = screen.getByRole('autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'test_');
    autocomplete.focus();
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    expect(changeXAxis).toHaveBeenCalledWith('test_1');
    expect(changeXAxisScale).toHaveBeenCalledWith('linear');
  });

  it('allows user to select an x-axis (mouse and keyboard)', async () => {
    createView();

    const autocomplete = screen.getByRole('autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'test_');
    await user.click(screen.getByText('test_1'));

    expect(changeXAxis).toHaveBeenCalledWith('test_1');
    expect(changeXAxisScale).toHaveBeenCalledWith('linear');
  });

  it('changes scale to time automatically if time is selected as x-axis', async () => {
    createView();

    const autocomplete = screen.getByRole('autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'time');
    autocomplete.focus();
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    expect(changeXAxis).toHaveBeenCalledWith('timestamp');
    expect(changeXAxisScale).toHaveBeenCalledWith('time');
  });

  it('removes x-axis from display when we click Close on its label', async () => {
    props.XAxis = 'timestamp';
    createView();

    await user.click(screen.getByLabelText('Remove timestamp from x-axis'));
    expect(changeXAxis).toHaveBeenLastCalledWith('');
    expect(changeXAxisScale).toHaveBeenCalledWith('linear');
  });

  describe('min and max fields', () => {
    describe('numeric values', () => {
      it('lets user change the min field and calls relevant onchange method', async () => {
        createView();

        const minField = screen.getByLabelText('Min');
        await user.type(minField, '1');
        expect(changeXMinimum).toHaveBeenCalledWith(1);
      });

      it('lets user change the max field and calls relevant onchange method', async () => {
        createView();

        const maxField = screen.getByLabelText('Max');
        await user.type(maxField, '1');
        expect(changeXMaximum).toHaveBeenCalledWith(1);
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
    });

    describe('date-time values', () => {
      beforeEach(() => {
        applyDatePickerWorkaround();
        props.XAxis = 'timestamp';
        props.XAxisScale = 'time';
      });

      afterEach(() => {
        cleanupDatePickerWorkaround();
      });

      it('lets user change the fromDate field and calls relevant onchange method', async () => {
        createView();

        const selectedDate = new Date('2022-01-01 00:00:00');
        const dateFilterFromDate = screen.getByLabelText(
          'from, date-time input'
        );
        await userEvent.type(
          dateFilterFromDate,
          format(selectedDate, 'yyyy-MM-dd HH:mm:ss')
        );
        expect(changeXMinimum).toHaveBeenCalledWith(selectedDate.getTime());
      });

      it('lets user change the toDate field and calls relevant onchange method', async () => {
        createView();

        const selectedDate = new Date('2022-01-01 00:00:00');
        const dateFilterToDate = screen.getByLabelText('to, date-time input');
        await userEvent.type(
          dateFilterToDate,
          format(selectedDate, 'yyyy-MM-dd HH:mm:ss')
        );
        expect(changeXMaximum).toHaveBeenCalledWith(selectedDate.getTime());
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
          format(selectedFromDate, 'yyyy-MM-dd HH:mm:ss')
        );
        await userEvent.type(
          dateFilterToDate,
          format(selectedToDate, 'yyyy-MM-dd HH:mm:ss')
        );

        // Check the helper text displays
        screen.getAllByText('Invalid date-time range');

        // One for each input box
        expect(screen.getAllByText('Invalid date-time range').length).toEqual(
          2
        );
      });
    });
  });
});
