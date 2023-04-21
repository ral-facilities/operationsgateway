import React from 'react';
import ShotNumber, { type ShotNumberProps } from './shotNumber.component';
import {
  screen,
  render,
  type RenderResult,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('shotNumber search', () => {
  let props: ShotNumberProps;
  const changeSearchParameterShotnumMin = jest.fn();
  const changeSearchParameterShotnumMax = jest.fn();
  const resetDateRange = jest.fn();
  let user;

  const createView = (): RenderResult => {
    return render(<ShotNumber {...props} />);
  };

  beforeEach(() => {
    props = {
      changeSearchParameterShotnumMin,
      changeSearchParameterShotnumMax,
      resetDateRange,
      isDateToShotnum: false,
    };

    user = userEvent.setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const { asFragment } = createView();
    await user.click(screen.getByLabelText('open shot number search box'));
    expect(asFragment()).toMatchSnapshot();
  });

  it('can open and close its popup window', async () => {
    createView();

    await user.click(screen.getByLabelText('open shot number search box'));
    const shotnumPopup = screen.getByRole('dialog');
    expect(
      within(shotnumPopup).getByText('Select your shot number')
    ).toBeInTheDocument();
    await user.click(screen.getByLabelText('close shot number search box'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Select your shot number')
    ).not.toBeInTheDocument();
  });

  it('allows user to change min and max values and not show error when valid input', async () => {
    createView();

    await user.click(screen.getByLabelText('open shot number search box'));
    const shotnumPopup = screen.getByRole('dialog');
    const minInput = within(shotnumPopup).getByRole('spinbutton', {
      name: 'Min',
    });
    const maxInput = within(shotnumPopup).getByRole('spinbutton', {
      name: 'Max',
    });

    await user.type(minInput, '1');
    await user.type(maxInput, '2');
    expect(changeSearchParameterShotnumMin).toHaveBeenCalledWith(1);
    expect(changeSearchParameterShotnumMax).toHaveBeenCalledWith(2);
    expect(resetDateRange).toHaveBeenCalled();
    const helperTexts = within(shotnumPopup).queryAllByText('Invalid range');
    expect(helperTexts.length).toEqual(0);
  });

  it('displays invalid range message when min > max', async () => {
    props = {
      ...props,
      searchParameterShotnumMin: 1,
      searchParameterShotnumMax: 0,
    };
    createView();

    await user.click(screen.getByLabelText('open shot number search box'));
    const shotnumPopup = screen.getByRole('dialog');
    const minInput = within(shotnumPopup).getByRole('spinbutton', {
      name: 'Min',
    });
    const maxInput = within(shotnumPopup).getByRole('spinbutton', {
      name: 'Max',
    });

    expect(minInput).toHaveValue(1);
    expect(maxInput).toHaveValue(0);

    const helperTexts = within(shotnumPopup).getAllByText('Invalid range');
    // One helper text below each input
    expect(helperTexts.length).toEqual(2);
  });

  describe('displays the currently selected shot number range', () => {
    it('none', () => {
      createView();
      expect(screen.getByText('Select')).toBeInTheDocument();
    });

    it('minimum only', () => {
      props = {
        ...props,
        searchParameterShotnumMin: 1,
      };
      createView();
      expect(screen.getByText('Minimum: 1')).toBeInTheDocument();
    });

    it('maximum only', () => {
      props = {
        ...props,
        searchParameterShotnumMax: 1,
      };
      createView();
      expect(screen.getByText('Maximum: 1')).toBeInTheDocument();
    });

    it('minimum and maximum', () => {
      props = {
        ...props,
        searchParameterShotnumMin: 1,
        searchParameterShotnumMax: 2,
      };
      createView();
      expect(screen.getByText('1 to 2')).toBeInTheDocument();
    });
  });
});
