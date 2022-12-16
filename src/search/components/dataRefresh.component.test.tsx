import React from 'react';
import DataRefresh, { type DataRefreshProps } from './dataRefresh.component';
import { render, screen, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('DataRefresh', () => {
  let props: DataRefreshProps;
  const refreshData = jest.fn();

  const createView = (): RenderResult => {
    return render(<DataRefresh {...props} />);
  };

  beforeEach(() => {
    props = {
      timeframeSet: true,
      refreshData,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { asFragment } = createView();

    expect(asFragment()).toMatchSnapshot();
  });

  it('is disabled and does not call refreshData on click if no timeframe is currently set', async () => {
    props.timeframeSet = false;
    createView();

    const button = screen.getByRole('button', { name: 'Refresh data' });
    expect(button).toBeDisabled();
  });

  it('calls refreshData on click if timeframe set', async () => {
    const user = userEvent.setup();
    createView();

    const button = screen.getByRole('button', { name: 'Refresh data' });
    await user.click(button);
    expect(refreshData).toHaveBeenCalledTimes(1);
  });
});
