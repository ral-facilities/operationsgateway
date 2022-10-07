import React from 'react';
import ChartTypeButtons from './chartTypeButtons.component';
import type { ChartTypeButtonsProps } from './chartTypeButtons.component';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Chart Type Buttons', () => {
  let props: ChartTypeButtonsProps;
  let user;
  const changePlotType = jest.fn();

  beforeEach(() => {
    props = {
      plotType: 'scatter',
      changePlotType,
    };

    user = userEvent.setup({ delay: null });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders plot type button and calls changePlotType on click', async () => {
    render(<ChartTypeButtons {...props} />);

    expect(
      screen.getByRole('button', { pressed: true, name: 'scatter chart' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { pressed: false, name: 'line chart' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'line chart' }));
    expect(changePlotType).toHaveBeenCalledWith('line');
  });
});
