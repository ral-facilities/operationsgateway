import { render, screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import type { ChartTypeButtonsProps } from './chartTypeButtons.component';
import ChartTypeButtons from './chartTypeButtons.component';

describe('Chart Type Buttons', () => {
  let props: ChartTypeButtonsProps;
  let user: UserEvent;
  const changePlotType = vi.fn();
  const changeXAxis = vi.fn();

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
    vi.clearAllMocks();
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
      screen.getByRole('button', { pressed: true, name: 'Scatter Chart' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { pressed: false, name: 'Line Chart' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Line Chart' }));
    expect(changePlotType).toHaveBeenCalledWith('line');
  });

  it('does not render plot type buttons when x axis is not time', async () => {
    props.XAxis = undefined;
    render(<ChartTypeButtons {...props} />);

    expect(
      screen.queryByRole('button', { name: 'Scatter Chart' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { pressed: false, name: 'Line Chart' })
    ).not.toBeInTheDocument();
  });
});
