import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AutoRefreshToggle, {
  AUTO_REFRESH_INTERVAL_MS,
} from './autoRefreshToggle.component';

describe('AutoRefreshToggle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should enable auto refresh if enabled', () => {
    const onRequestRefresh = jest.fn();

    render(<AutoRefreshToggle enabled onRequestRefresh={onRequestRefresh} />);

    expect(
      screen.getByRole('checkbox', { name: 'Auto refresh' })
    ).toBeChecked();

    jest.advanceTimersByTime(AUTO_REFRESH_INTERVAL_MS);

    expect(onRequestRefresh).toBeCalled();
  });

  it('should not enable auto refresh if disabled', () => {
    const onRequestRefresh = jest.fn();

    render(
      <AutoRefreshToggle enabled={false} onRequestRefresh={onRequestRefresh} />
    );

    expect(
      screen.getByRole('checkbox', { name: 'Auto refresh' })
    ).not.toBeChecked();

    jest.advanceTimersByTime(AUTO_REFRESH_INTERVAL_MS);

    expect(onRequestRefresh).not.toBeCalled();
  });

  it('should cancel auto refresh when unchecked', async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const onRequestRefresh = jest.fn();

    render(<AutoRefreshToggle enabled onRequestRefresh={onRequestRefresh} />);

    // run the timer to run the callback once
    jest.advanceTimersByTime(AUTO_REFRESH_INTERVAL_MS);

    expect(onRequestRefresh).toBeCalledTimes(1);

    const toggle = screen.getByRole('checkbox', { name: 'Auto refresh' });

    await user.click(toggle);
    expect(toggle).not.toBeChecked();

    // wait for another interval to make sure the callback is not called again
    act(() => {
      jest.advanceTimersByTime(AUTO_REFRESH_INTERVAL_MS);
    });

    expect(onRequestRefresh).toBeCalledTimes(1);
  });
});
