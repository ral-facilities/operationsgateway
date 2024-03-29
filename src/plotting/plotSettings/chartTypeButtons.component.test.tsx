import React from 'react';
import ChartTypeButtons from './chartTypeButtons.component';
import type { ChartTypeButtonsProps } from './chartTypeButtons.component';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Chart Type Buttons', () => {
  let props: ChartTypeButtonsProps;
  let user;
  const changePlotType = jest.fn();
  const changeXAxis = jest.fn();

  beforeEach(() => {
    props = {
      plotType: 'scatter',
      XAxis: 'timestamp',
      changePlotType,
      changeXAxis,
    };

    user = userEvent.setup({ delay: null });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls changePlotType and changeXAxis when XY button is clicked', async () => {
    render(<ChartTypeButtons {...props} />);

    expect(
      screen.getByRole('button', { pressed: true, name: 'Timeseries' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { pressed: false, name: 'XY' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'XY' }));

    expect(changePlotType).toHaveBeenCalledWith('scatter');
    expect(changeXAxis).toHaveBeenCalledWith(undefined);
  });

  it('calls changeXAxis when timeseries button is clicked', async () => {
    props.XAxis = undefined;
    render(<ChartTypeButtons {...props} />);

    expect(
      screen.getByRole('button', { pressed: false, name: 'Timeseries' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { pressed: true, name: 'XY' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Timeseries' }));

    expect(changeXAxis).toHaveBeenCalledWith('timestamp');
  });

  it('renders plot type button and calls changePlotType on click when x axis is time', async () => {
    render(<ChartTypeButtons {...props} />);

    expect(
      screen.getByRole('button', { pressed: true, name: 'Timeseries' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { pressed: true, name: 'scatter chart' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { pressed: false, name: 'line chart' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'line chart' }));
    expect(changePlotType).toHaveBeenCalledWith('line');
  });

  it('does not render plot type buttons when x axis is not time', async () => {
    props.XAxis = undefined;
    render(<ChartTypeButtons {...props} />);

    expect(
      screen.queryByRole('button', { name: 'scatter chart' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { pressed: false, name: 'line chart' })
    ).not.toBeInTheDocument();
  });
});
