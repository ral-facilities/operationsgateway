import React from 'react';
import { render, screen, within } from '@testing-library/react';
import PlotSettings, { PlotSettingsProps } from './plotSettings.component';
import userEvent from '@testing-library/user-event';

describe('Plot Settings component', () => {
  let props: PlotSettingsProps;
  const changePlotTitle = jest.fn();
  const changePlotType = jest.fn();
  const changeXAxisSettings = jest.fn();
  const changeYAxesSettings = jest.fn();

  const createView = () => {
    return render(<PlotSettings {...props} />);
  };

  beforeEach(() => {
    props = {
      changePlotTitle,
      plotType: 'scatter',
      changePlotType,
      XAxisSettings: { scale: 'time' },
      changeXAxisSettings,
      YAxesSettings: { scale: 'linear' },
      changeYAxesSettings,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders plot settings form correctly', () => {
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('lets user change the plot title and calls changePlotTitle', async () => {
    const user = userEvent.setup();
    createView();

    const titleInput = screen.getByRole('textbox', { name: 'Title' });

    await user.type(titleInput, 'Test title');

    expect(titleInput).toHaveValue('Test title');

    expect(changePlotTitle).toHaveBeenCalledWith('Test title');
  });

  it('renders plot type button and calls changePlotType on click', async () => {
    const user = userEvent.setup();
    createView();

    expect(
      screen.getByRole('button', { pressed: true, name: 'scatter chart' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { pressed: false, name: 'line chart' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'line chart' }));
    expect(changePlotType).toHaveBeenCalledWith('line');
  });

  it('lets user switch between X and Y settings tabs', async () => {
    const user = userEvent.setup();
    createView();

    // should load X tab initially
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('X');
    expect(screen.getByRole('tabpanel', { name: 'X' })).toBeVisible();
    expect(
      screen.queryByRole('tabpanel', { name: 'Y' })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Y' }));

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Y');
    expect(screen.getByRole('tabpanel', { name: 'Y' })).toBeVisible();
    expect(
      screen.queryByRole('tabpanel', { name: 'X' })
    ).not.toBeInTheDocument();
  });

  it('does not let the user change the X axis scale if time is selected as the X axis', async () => {
    createView();

    const radioGroup = screen.getByRole('radiogroup', { name: 'Scale' });
    const radioButtons = within(radioGroup).getAllByRole('radio');
    radioButtons.forEach((radioButton) => {
      expect(radioButton).toBeDisabled();
    });
  });

  it('renders Y scale radio buttons and calls changeYAxesSettings on click', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByRole('tab', { name: 'Y' }));

    const radioGroup = screen.getByRole('radiogroup', { name: 'Scale' });
    expect(
      within(radioGroup).getByRole('radio', {
        name: 'Linear',
      })
    ).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Log' }));

    expect(changeYAxesSettings).toHaveBeenCalledWith({
      ...props.YAxesSettings,
      scale: 'log',
    });
  });
});
