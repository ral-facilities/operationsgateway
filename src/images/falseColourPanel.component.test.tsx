import { fireEvent, screen, within } from '@testing-library/react';
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
      colourMap: 'colourmap_1',
      lowerLevel: 0,
      upperLevel: 255,
      changeColourMap,
      changeLowerLevel,
      changeUpperLevel,
    };
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

    const select = screen.getByLabelText('Colour Map');
    await user.click(select);

    let dropdown = screen.getByRole('listbox', {
      name: 'Colour Map',
    });
    await user.click(
      within(dropdown).getByRole('option', { name: 'colourmap_2' })
    );

    expect(changeColourMap).toHaveBeenCalledWith('colourmap_2');

    jest.clearAllMocks();

    // check user can select "default" colourmap
    await user.click(select);
    dropdown = screen.getByRole('listbox', {
      name: 'Colour Map',
    });
    await user.click(within(dropdown).getByRole('option', { name: 'Default' }));

    expect(changeColourMap).toHaveBeenCalledWith(undefined);
  });

  it('renders lower level slider and changes lower level on change', async () => {
    createView();

    const sliderInput = screen.getByRole('slider', {
      name: 'Lower Level (LL)',
    });

    await fireEvent.change(sliderInput, { target: { value: 25 } });

    expect(changeLowerLevel).toHaveBeenCalledWith(25);
  });

  it('renders upper level slider and changes upper level on change', async () => {
    createView();

    const sliderInput = screen.getByRole('slider', {
      name: 'Upper Level (UL)',
    });

    await fireEvent.change(sliderInput, { target: { value: 25 } });

    expect(changeLowerLevel).toHaveBeenCalledWith(25);
  });

  it('can be disabled and re-enabled', async () => {
    const user = userEvent.setup();
    createView();

    // "load" requests
    await flushPromises();

    const falseColourSwitch = screen.getByRole('checkbox', {
      name: 'False Colour',
    });

    expect(falseColourSwitch).toBeChecked();

    await user.click(falseColourSwitch);

    expect(falseColourSwitch).not.toBeChecked();
    expect(changeColourMap).toHaveBeenCalledWith(undefined);
    expect(changeLowerLevel).toHaveBeenCalledWith(undefined);
    expect(changeUpperLevel).toHaveBeenCalledWith(undefined);

    jest.clearAllMocks();

    await user.click(falseColourSwitch);

    expect(falseColourSwitch).toBeChecked();
    expect(changeColourMap).toHaveBeenCalledWith(undefined);
    expect(changeLowerLevel).toHaveBeenCalledWith(0);
    expect(changeUpperLevel).toHaveBeenCalledWith(255);

    // check that it can restore a selected colourmap as well
    const select = screen.getByLabelText('Colour Map');
    await user.click(select);

    const dropdown = screen.getByRole('listbox', {
      name: 'Colour Map',
    });
    await user.click(
      within(dropdown).getByRole('option', { name: 'colourmap_2' })
    );

    await user.click(falseColourSwitch);
    jest.clearAllMocks();
    await user.click(falseColourSwitch);

    expect(falseColourSwitch).toBeChecked();
    expect(changeColourMap).toHaveBeenCalledWith('colourmap_2');
  });
});
