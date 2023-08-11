import React from 'react';
import MaxShots, { type MaxShotsProps } from './maxShots.component';
import {
  render,
  screen,
  within,
  type RenderResult,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('maxShots search', () => {
  let props: MaxShotsProps;
  const changeMaxShots = jest.fn();
  const searchParamsUpdated = jest.fn();

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
      searchParamsUpdated,
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
        searchParamsUpdated,
      };
      createView();

      const maxShotsRadioGroup = screen.getByRole('radiogroup', {
        name: 'select max shots',
      });
      await user.click(
        within(maxShotsRadioGroup).getByLabelText('Select 50 max shots')
      );
      expect(changeMaxShots).toHaveBeenCalledWith(50);
      expect(searchParamsUpdated).toHaveBeenCalled();
    });

    it('1000 shots', async () => {
      props = {
        maxShots: 50,
        changeMaxShots,
        searchParamsUpdated,
      };
      createView();

      const maxShotsRadioGroup = screen.getByRole('radiogroup', {
        name: 'select max shots',
      });
      await user.click(
        within(maxShotsRadioGroup).getByLabelText('Select 1000 max shots')
      );
      expect(changeMaxShots).toHaveBeenCalledWith(1000);
      expect(searchParamsUpdated).toHaveBeenCalled();
    });

    it('unlimited', async () => {
      props = {
        maxShots: 50,
        changeMaxShots,
        searchParamsUpdated,
      };
      createView();

      const maxShotsRadioGroup = screen.getByRole('radiogroup', {
        name: 'select max shots',
      });
      await user.click(
        within(maxShotsRadioGroup).getByLabelText('Select unlimited max shots')
      );
      expect(changeMaxShots).toHaveBeenCalledWith(Infinity);
      expect(searchParamsUpdated).toHaveBeenCalled();
    });
  });
});
