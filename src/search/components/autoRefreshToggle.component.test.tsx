import { render, screen } from '@testing-library/react';
import AutoRefreshToggle, {
  AUTO_REFRESH_INTERVAL_MS,
} from './autoRefreshToggle.component';
import userEvent from '@testing-library/user-event';
// import userEvent from '@testing-library/user-event';

describe('AutoRefreshToggle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should enable auto refresh by default', () => {
    const onRequestRefresh = jest.fn();

    render(<AutoRefreshToggle onRequestRefresh={onRequestRefresh} />);

    expect(
      screen.getByRole('checkbox', { name: 'Auto refresh' })
    ).toBeChecked();

    jest.advanceTimersByTime(AUTO_REFRESH_INTERVAL_MS);

    expect(onRequestRefresh).toBeCalled();
  });

  it('should cancel auto refresh when disabled', async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const onRequestRefresh = jest.fn();

    render(<AutoRefreshToggle onRequestRefresh={onRequestRefresh} />);

    // run the timer to run the callback once
    jest.advanceTimersByTime(AUTO_REFRESH_INTERVAL_MS);

    expect(onRequestRefresh).toBeCalledTimes(1);

    const toggle = screen.getByRole('checkbox', { name: 'Auto refresh' });

    await user.click(toggle);
    expect(toggle).not.toBeChecked();

    // wait for another interval to make sure the callback is not called again
    jest.advanceTimersByTime(AUTO_REFRESH_INTERVAL_MS);

    expect(onRequestRefresh).toBeCalledTimes(1);
  });
});
