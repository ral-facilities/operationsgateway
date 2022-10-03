import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import PlotSettings, { PlotSettingsProps } from './plotSettings.component';
import userEvent from '@testing-library/user-event';
import { FullScalarChannelMetadata } from '../app.types';

describe('Plot Settings component', () => {
  let props: PlotSettingsProps;
  let user;
  const changePlotTitle = jest.fn();
  const changePlotType = jest.fn();
  const changeXAxis = jest.fn();
  const changeXAxisSettings = jest.fn();
  const changeYAxesSettings = jest.fn();
  const changeSelectedChannels = jest.fn();

  const createView = () => {
    return render(<PlotSettings {...props} />);
  };

  const channels: FullScalarChannelMetadata[] = [
    {
      systemName: 'CHANNEL_1',
      channel_dtype: 'scalar',
    },
    {
      systemName: 'CHANNEL_2',
      channel_dtype: 'scalar',
    },
    {
      systemName: 'CHANNEL_3',
      channel_dtype: 'scalar',
    },
  ];

  beforeEach(() => {
    props = {
      channels,
      changePlotTitle,
      plotType: 'scatter',
      changePlotType,
      XAxis: '',
      changeXAxis,
      XAxisSettings: { scale: 'linear' },
      changeXAxisSettings,
      YAxesSettings: { scale: 'linear' },
      changeYAxesSettings,
      selectedChannels: [],
      changeSelectedChannels,
    };

    user = userEvent.setup({ delay: null });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders plot settings form correctly (x-axis tab selected)', () => {
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders plot settings form correctly (y-axis tab selected)', async () => {
    const view = createView();
    await user.click(screen.getByRole('tab', { name: 'Y' }));

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('lets user change the plot title and calls changePlotTitle', async () => {
    createView();

    const titleInput = screen.getByRole('textbox', { name: 'Title' });

    await user.type(titleInput, 'Test title');

    expect(titleInput).toHaveValue('Test title');

    expect(changePlotTitle).toHaveBeenCalledWith('Test title');
  });

  it('renders plot type button and calls changePlotType on click', async () => {
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
    props.XAxis = 'timestamp';
    props.XAxisSettings.scale = 'time';
    createView();

    const radioGroup = screen.getByRole('radiogroup', { name: 'Scale' });
    const radioButtons = within(radioGroup).getAllByRole('radio');
    radioButtons.forEach((radioButton) => {
      expect(radioButton).toBeDisabled();
    });
  });

  it('renders X scale radio buttons and calls changeXAxisSettings on click', async () => {
    createView();

    const radioGroup = screen.getByRole('radiogroup', { name: 'Scale' });
    expect(
      within(radioGroup).getByRole('radio', {
        name: 'Linear',
      })
    ).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Log' }));

    expect(changeXAxisSettings).toHaveBeenCalledWith({
      ...props.YAxesSettings,
      scale: 'logarithmic',
    });
  });

  it('renders Y scale radio buttons and calls changeYAxesSettings on click', async () => {
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
      scale: 'logarithmic',
    });
  });

  it('allows user to select an x-axis (keyboard only)', async () => {
    createView();

    const autocomplete = screen.getByRole('autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'CHANNEL');
    autocomplete.focus();
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    expect(changeXAxis).toHaveBeenCalledWith('CHANNEL_1');
    expect(changeXAxisSettings).toHaveBeenCalledWith({
      ...props.XAxisSettings,
      scale: 'linear',
    });
  });

  it('allows user to select an x-axis (mouse and keyboard)', async () => {
    createView();

    const autocomplete = screen.getByRole('autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'CHANNEL');
    await user.click(screen.getByText('CHANNEL_1'));

    expect(changeXAxis).toHaveBeenCalledWith('CHANNEL_1');
    expect(changeXAxisSettings).toHaveBeenCalledWith({
      ...props.XAxisSettings,
      scale: 'linear',
    });
  });

  it('allows user to add channels on the y-axis (keyboard only)', async () => {
    createView();

    await user.click(screen.getByRole('tab', { name: 'Y' }));

    const autocomplete = screen.getByRole('autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'CHANNEL');
    autocomplete.focus();
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    expect(changeSelectedChannels).toHaveBeenCalledWith([
      {
        name: 'CHANNEL_1',
        options: {
          visible: true,
        },
      },
    ]);
  });

  it('allows user to add channels on the y-axis (mouse and keyboard)', async () => {
    createView();

    await user.click(screen.getByRole('tab', { name: 'Y' }));

    const autocomplete = screen.getByRole('autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'CHANNEL');
    await user.click(screen.getByText('CHANNEL_1'));

    expect(changeSelectedChannels).toHaveBeenCalledWith([
      {
        name: 'CHANNEL_1',
        options: {
          visible: true,
        },
      },
    ]);
  });

  it('changes scale to time automatically if time is selected as x-axis', async () => {
    createView();

    const autocomplete = screen.getByRole('autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'time');
    autocomplete.focus();
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    expect(changeXAxis).toHaveBeenCalledWith('timestamp');
    expect(changeXAxisSettings).toHaveBeenCalledWith({
      ...props.XAxisSettings,
      scale: 'time',
    });
  });

  it('allows user to toggle visibility of a selected channel off', async () => {
    props.selectedChannels = [
      {
        name: 'CHANNEL_1',
        options: {
          visible: true,
        },
      },
    ];
    createView();

    await user.click(screen.getByRole('tab', { name: 'Y' }));

    await user.click(screen.getByLabelText('Toggle CHANNEL_1 visibility off'));
    expect(changeSelectedChannels).toHaveBeenLastCalledWith([
      {
        name: 'CHANNEL_1',
        options: {
          visible: false,
        },
      },
    ]);
  });

  it('allows user to toggle visibility of a selected channel on', async () => {
    props.selectedChannels = [
      {
        name: 'CHANNEL_1',
        options: {
          visible: true,
        },
      },
      {
        name: 'CHANNEL_2',
        options: {
          visible: false,
        },
      },
    ];
    createView();

    await user.click(screen.getByRole('tab', { name: 'Y' }));

    await user.click(screen.getByLabelText('Toggle CHANNEL_2 visibility on'));
    expect(changeSelectedChannels).toHaveBeenLastCalledWith([
      {
        name: 'CHANNEL_1',
        options: {
          visible: true,
        },
      },
      {
        name: 'CHANNEL_2',
        options: {
          visible: true,
        },
      },
    ]);
  });

  it('removes x-axis from display when we click Close on its label', async () => {
    props.XAxis = 'timestamp';
    createView();

    await user.click(screen.getByLabelText('Remove timestamp from x-axis'));
    expect(changeXAxis).toHaveBeenLastCalledWith('');
    expect(changeXAxisSettings).toHaveBeenCalledWith({
      ...props.XAxisSettings,
      scale: 'linear',
    });
  });

  it('removes channel from display when we click Close on its label', async () => {
    props.selectedChannels = [
      {
        name: 'CHANNEL_1',
        options: {
          visible: true,
        },
      },
      {
        name: 'CHANNEL_2',
        options: {
          visible: true,
        },
      },
    ];
    createView();

    await user.click(screen.getByRole('tab', { name: 'Y' }));

    await user.click(screen.getByLabelText('Remove CHANNEL_1 from plot'));
    expect(changeSelectedChannels).toHaveBeenLastCalledWith([
      {
        name: 'CHANNEL_2',
        options: {
          visible: true,
        },
      },
    ]);
    expect(changeYAxesSettings).not.toHaveBeenCalled();
  });

  it('removes channel from display when we click Close on its label and resets y-axis scale to linear if no selected channels remain', async () => {
    props.selectedChannels = [
      {
        name: 'CHANNEL_1',
        options: {
          visible: true,
        },
      },
    ];
    createView();

    await user.click(screen.getByRole('tab', { name: 'Y' }));

    await user.click(screen.getByLabelText('Remove CHANNEL_1 from plot'));
    expect(changeSelectedChannels).toHaveBeenLastCalledWith([]);
    expect(changeYAxesSettings).toHaveBeenCalledWith({
      ...props.YAxesSettings,
      scale: 'linear',
    });
  });
});
