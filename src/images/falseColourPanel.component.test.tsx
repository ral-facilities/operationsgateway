import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { flushPromises, renderComponentWithProviders } from '../setupTests';
import FalseColourPanel from './falseColourPanel.component';

describe('False colour panel component', () => {
  let props: React.ComponentProps<typeof FalseColourPanel>;
  const changeColourMap = jest.fn();
  const changeLowerLevel = jest.fn();
  const changeUpperLevel = jest.fn();

  beforeEach(() => {
    props = {
      colourMap: 'cividis',
      lowerLevel: 0,
      upperLevel: 255,
      changeColourMap,
      changeLowerLevel,
      changeUpperLevel,
    };

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createView = () => {
    return renderComponentWithProviders(<FalseColourPanel {...props} />);
  };

  it('renders correctly', async () => {
    const { asFragment } = createView();

    // "load" requests
    await flushPromises();

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders colour map dropdown and changes colour map on change', async () => {
    const user = userEvent.setup();
    createView();

    // "load" requests
    await flushPromises();

    await waitFor(() => {
      screen.getByLabelText('Colour Map');
    });

    const select = screen.getByLabelText('Colour Map');
    await user.click(select);

    let dropdown = screen.getByRole('listbox', {
      name: 'Colour Map',
    });
    await user.click(within(dropdown).getByRole('option', { name: 'cividis' }));

    expect(changeColourMap).toHaveBeenCalledWith('cividis');

    jest.clearAllMocks();

    // check user can select "default" colourmap
    await user.click(select);
    dropdown = screen.getByRole('listbox', {
      name: 'Colour Map',
    });
    await user.click(within(dropdown).getByRole('option', { name: 'Default' }));

    expect(changeColourMap).toHaveBeenCalledWith(undefined);
  });

  it('renders range level slider, changes lower level on change and changes higher level on change', async () => {
    createView();

    const sliderInput = screen.getAllByRole('slider', {
      name: 'Level Range',
    });

    const lowerSliderInput = sliderInput[0];

    const upperSliderInput = sliderInput[1];

    await fireEvent.change(lowerSliderInput, { target: { value: 25 } });

    await fireEvent.change(upperSliderInput, { target: { value: 50 } });

    expect(changeLowerLevel).toHaveBeenCalledWith(25);

    expect(changeUpperLevel).toHaveBeenCalledWith(50);
  });

  it('can be disabled and re-enabled', async () => {
    const user = userEvent.setup();
    createView();

    // "load" requests
    await flushPromises();

    const falseColourSwitch = screen.getByRole('checkbox', {
      name: 'False Colour',
    });

    const extendedColourMapSwitch = screen.getByRole('checkbox', {
      name: 'Show extended colourmap options',
    });

    expect(falseColourSwitch).toBeChecked();

    expect(extendedColourMapSwitch).not.toBeDisabled();

    await user.click(falseColourSwitch);

    expect(falseColourSwitch).not.toBeChecked();
    expect(changeColourMap).toHaveBeenCalledWith(undefined);
    expect(changeLowerLevel).toHaveBeenCalledWith(undefined);
    expect(changeUpperLevel).toHaveBeenCalledWith(undefined);
    expect(extendedColourMapSwitch).toBeDisabled();

    jest.clearAllMocks();

    await user.click(falseColourSwitch);

    expect(falseColourSwitch).toBeChecked();
    expect(changeColourMap).toHaveBeenCalledWith(undefined);
    expect(changeLowerLevel).toHaveBeenCalledWith(0);
    expect(changeUpperLevel).toHaveBeenCalledWith(255);

    // check that it can restore a selected colourmap as well

    await waitFor(() => {
      screen.getByLabelText('Colour Map');
    });

    const select = screen.getByLabelText('Colour Map');
    await user.click(select);

    const dropdown = screen.getByRole('listbox', {
      name: 'Colour Map',
    });
    await user.click(within(dropdown).getByRole('option', { name: 'cividis' }));

    await user.click(falseColourSwitch);
    jest.clearAllMocks();
    await user.click(falseColourSwitch);

    expect(falseColourSwitch).toBeChecked();
    expect(changeColourMap).toHaveBeenCalledWith('cividis');
  });

  it('reverse the colour map if a reverse colour map exist for a given colour map', async () => {
    const user = userEvent.setup();
    createView();

    await waitFor(() => {
      screen.getByLabelText('Colour Map');
    });

    const select = screen.getByLabelText('Colour Map');
    await user.click(select);

    const dropdown = screen.getByRole('listbox', {
      name: 'Colour Map',
    });
    await user.click(within(dropdown).getByRole('option', { name: 'inferno' }));

    expect(changeColourMap).toHaveBeenCalledWith('inferno');

    const reverseColourSwitch = screen.getByRole('checkbox', {
      name: 'Reverse Colour',
    });

    expect(reverseColourSwitch).not.toBeChecked();
    expect(reverseColourSwitch).toBeEnabled();

    await user.click(reverseColourSwitch);

    expect(reverseColourSwitch).toBeEnabled();
    expect(reverseColourSwitch).toBeChecked();
    expect(changeColourMap).toHaveBeenCalledWith('inferno_r');

    jest.clearAllMocks();

    const select2 = screen.getByLabelText('Colour Map');
    await user.click(select);

    const dropdown2 = screen.getByRole('listbox', {
      name: 'Colour Map',
    });

    await user.click(select2);

    await user.click(
      within(dropdown2).getByRole('option', { name: 'cividis' })
    );

    expect(changeColourMap).toHaveBeenCalledWith('cividis_r');

    jest.clearAllMocks();

    await user.click(reverseColourSwitch);
    expect(changeColourMap).toHaveBeenCalledWith('cividis');

    await user.click(reverseColourSwitch);

    jest.clearAllMocks();

    // the reverse colour is disabled when it doesn't exist

    const extendedColourMapSwitch = screen.getByRole('checkbox', {
      name: 'Show extended colourmap options',
    });

    await user.click(extendedColourMapSwitch);

    expect(extendedColourMapSwitch).toBeChecked();

    const extendedSelect = screen.getByLabelText('Colour Map');
    await user.click(extendedSelect);

    const extendedDropdown = screen.getByRole('listbox', {
      name: 'Colour Map',
    });

    await user.click(
      within(extendedDropdown).getByRole('option', { name: 'afmhot' })
    );

    expect(changeColourMap).toHaveBeenCalledWith('afmhot');
    expect(reverseColourSwitch).toBeDisabled();
  });
});
