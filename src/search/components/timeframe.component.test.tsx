import React from 'react';
import Timeframe, { type TimeframeProps } from './timeframe.component';
import {
  render,
  screen,
  within,
  type RenderResult,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('timeframe search', () => {
  let props: TimeframeProps;
  let user;
  const changeTimeframe = jest.fn();

  const createView = (): RenderResult => {
    return render(<Timeframe {...props} />);
  };

  beforeEach(() => {
    props = {
      timeframe: null,
      changeTimeframe,
    };
    user = userEvent.setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const { asFragment } = createView();
    await user.click(screen.getByLabelText('open timeframe search box'));
    expect(asFragment()).toMatchSnapshot();
  });

  it('can open and close its popup window', async () => {
    createView();

    await user.click(screen.getByLabelText('open timeframe search box'));
    const timeframePopup = screen.getByRole('dialog');
    expect(
      within(timeframePopup).getByText('Select your timeframe')
    ).toBeInTheDocument();
    await user.click(screen.getByLabelText('close timeframe search box'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Select your timeframe')).not.toBeInTheDocument();
  });

  it('should display a relative timestamp if set in the timeframe display box', () => {
    props = {
      ...props,
      timeframe: {
        value: 5,
        timescale: 'hours',
      },
    };
    createView();

    const timeframeDisplayBox = screen.getByLabelText(
      'open timeframe search box'
    );
    expect(
      within(timeframeDisplayBox).getByText('5 hours')
    ).toBeInTheDocument();
  });

  describe('allows user to set predefined relative timestamps', () => {
    it('last 10 minutes', async () => {
      createView();

      await user.click(screen.getByLabelText('open timeframe search box'));
      const timeframePopup = screen.getByRole('dialog');

      await user.click(
        within(timeframePopup).getByRole('button', { name: 'Last 10 mins' })
      );
      expect(changeTimeframe).toHaveBeenCalledWith({
        value: 10,
        timescale: 'minutes',
      });
    });

    it('last 24 hours', async () => {
      createView();

      await user.click(screen.getByLabelText('open timeframe search box'));
      const timeframePopup = screen.getByRole('dialog');

      await user.click(
        within(timeframePopup).getByRole('button', { name: 'Last 24 hours' })
      );
      expect(changeTimeframe).toHaveBeenCalledWith({
        value: 24,
        timescale: 'hours',
      });
    });

    it('last 7 days', async () => {
      createView();

      await user.click(screen.getByLabelText('open timeframe search box'));
      const timeframePopup = screen.getByRole('dialog');

      await user.click(
        within(timeframePopup).getByRole('button', { name: 'Last 7 days' })
      );
      expect(changeTimeframe).toHaveBeenCalledWith({
        value: 7,
        timescale: 'days',
      });
    });
  });

  describe('allows user to set custom relative timestamps', () => {
    it('last 5 minutes', async () => {
      createView();

      await user.click(screen.getByLabelText('open timeframe search box'));
      const timeframePopup = screen.getByRole('dialog');

      const timeframeInput = within(timeframePopup).getByRole('spinbutton', {
        name: 'Timeframe',
      });
      await user.type(timeframeInput, '5');
      await user.click(
        within(timeframePopup).getByRole('button', { name: 'Mins' })
      );
      expect(changeTimeframe).toHaveBeenCalledWith({
        value: 5,
        timescale: 'minutes',
      });
    });

    it('last 18 hours', async () => {
      createView();

      await user.click(screen.getByLabelText('open timeframe search box'));
      const timeframePopup = screen.getByRole('dialog');

      const timeframeInput = within(timeframePopup).getByRole('spinbutton', {
        name: 'Timeframe',
      });
      await user.type(timeframeInput, '18');
      await user.click(
        within(timeframePopup).getByRole('button', { name: 'Hours' })
      );
      expect(changeTimeframe).toHaveBeenCalledWith({
        value: 18,
        timescale: 'hours',
      });
    });

    it('last 21 days', async () => {
      createView();

      await user.click(screen.getByLabelText('open timeframe search box'));
      const timeframePopup = screen.getByRole('dialog');

      const timeframeInput = within(timeframePopup).getByRole('spinbutton', {
        name: 'Timeframe',
      });
      await user.type(timeframeInput, '21');
      await user.click(
        within(timeframePopup).getByRole('button', { name: 'Days' })
      );
      expect(changeTimeframe).toHaveBeenCalledWith({
        value: 21,
        timescale: 'days',
      });
    });
  });
});
