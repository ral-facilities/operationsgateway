import React from 'react';
import MaxShots, { type MaxShotsProps } from './maxShots.component';
import { render, screen, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('maxShots search', () => {
  let props: MaxShotsProps;
  const changeMaxShots = jest.fn();

  const createView = (): RenderResult => {
    return render(<MaxShots {...props} />);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with a selected value', () => {
    props = {
      maxShots: 50,
      changeMaxShots,
    };

    const { asFragment } = createView();
    expect(asFragment()).toMatchSnapshot();
  });

  describe('calls changeMaxShots when user clicks on', () => {
    let user;
    const changeMaxShots = jest.fn();

    beforeEach(() => {
      user = userEvent.setup();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('50 shots', async () => {
      props = {
        maxShots: 100,
        changeMaxShots,
      };
      createView();

      await user.click(screen.getByRole('input', { name: '50' }));
      expect(changeMaxShots).toHaveBeenCalledWith(50);
    });
  });
});
