import React from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
import PlotSettings, { PlotSettingsProps } from './plotSettings.component';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../setupTests';
import { useChannels } from '../api/channels';
import { FullChannelMetadata } from '../app.types';

jest.mock('../api/channels', () => {
  const originalModule = jest.requireActual('../api/records');

  return {
    __esModule: true,
    ...originalModule,
    useChannels: jest.fn(),
  };
});

describe('Plot Settings component', () => {
  let props: PlotSettingsProps;
  const changePlotTitle = jest.fn();
  const changePlotType = jest.fn();
  const changeXAxis = jest.fn();
  const changeYAxis = jest.fn();
  const changeXAxisSettings = jest.fn();
  const changeYAxesSettings = jest.fn();

  const createView = () => {
    return renderWithProviders(<PlotSettings {...props} />);
  };

  const metadata: FullChannelMetadata[] = [
    {
      systemName: 'CHANNEL_1',
      dataType: 'scalar',
    },
    {
      systemName: 'CHANNEL_2',
      dataType: 'scalar',
    },
    {
      systemName: 'CHANNEL_3',
      dataType: 'scalar',
    },
  ];

  beforeEach(() => {
    props = {
      changePlotTitle,
      plotType: 'scatter',
      changePlotType,
      XAxis: '',
      changeXAxis,
      XAxisSettings: { scale: 'linear' },
      changeXAxisSettings,
      YAxis: '',
      changeYAxis,
      YAxesSettings: { scale: 'linear' },
      changeYAxesSettings,
    };

    (useChannels as jest.Mock).mockReturnValue({
      data: metadata,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders plot settings form correctly (x-axis tab selected)', () => {
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders plot settings form correctly (y-axis tab selected)', async () => {
    const user = userEvent.setup();
    const view = createView();
    await user.click(screen.getByRole('tab', { name: 'Y' }));

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
    props.XAxis = 'timestamp';
    props.XAxisSettings.scale = 'time';
    createView();

    const radioGroup = screen.getByRole('radiogroup', { name: 'Scale' });
    const radioButtons = within(radioGroup).getAllByRole('radio');
    radioButtons.forEach((radioButton) => {
      expect(radioButton).toBeDisabled();
    });
  });

  it('does not let the user change the Y axis scale if time is selected as the Y axis', async () => {
    props.YAxis = 'timestamp';
    props.YAxesSettings.scale = 'time';
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByRole('tab', { name: 'Y' }));

    const radioGroup = screen.getByRole('radiogroup', { name: 'Scale' });
    const radioButtons = within(radioGroup).getAllByRole('radio');
    radioButtons.forEach((radioButton) => {
      expect(radioButton).toBeDisabled();
    });
  });

  it('renders X scale radio buttons and calls changeXAxisSettings on click', async () => {
    const user = userEvent.setup();
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
      scale: 'logarithmic',
    });
  });

  it('allows user to select an x-axis (keyboard only)', async () => {
    const user = userEvent.setup();
    createView();

    let autocomplete = screen.getByRole('autocomplete');
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
    const user = userEvent.setup();
    createView();

    let autocomplete = screen.getByRole('autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'CHANNEL');
    await user.click(screen.getByText('CHANNEL_1'));

    expect(changeXAxis).toHaveBeenCalledWith('CHANNEL_1');
    expect(changeXAxisSettings).toHaveBeenCalledWith({
      ...props.XAxisSettings,
      scale: 'linear',
    });
  });

  it('allows user to select a y-axis (keyboard only)', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByRole('tab', { name: 'Y' }));

    let autocomplete = screen.getByRole('autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'CHANNEL');
    autocomplete.focus();
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    expect(changeYAxis).toHaveBeenCalledWith('CHANNEL_1');
    expect(changeYAxesSettings).toHaveBeenCalledWith({
      ...props.YAxesSettings,
      scale: 'linear',
    });
  });

  it('allows user to select a y-axis (mouse and keyboard)', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByRole('tab', { name: 'Y' }));

    let autocomplete = screen.getByRole('autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'CHANNEL');
    await user.click(screen.getByText('CHANNEL_1'));

    expect(changeYAxis).toHaveBeenCalledWith('CHANNEL_1');
    expect(changeYAxesSettings).toHaveBeenCalledWith({
      ...props.YAxesSettings,
      scale: 'linear',
    });
  });

  it('changes scale to time automatically if time is selected as x-axis', async () => {
    const user = userEvent.setup();
    createView();

    let autocomplete = screen.getByRole('autocomplete');
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

  it('changes scale to time automatically if time is selected as y-axis', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByRole('tab', { name: 'Y' }));

    let autocomplete = screen.getByRole('autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'time');
    autocomplete.focus();
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    expect(changeYAxis).toHaveBeenCalledWith('timestamp');
    expect(changeYAxesSettings).toHaveBeenCalledWith({
      ...props.YAxesSettings,
      scale: 'time',
    });
  });

  it('removes x-axis from display when we click Close on its label', async () => {
    const user = userEvent.setup();
    props.XAxis = 'test';
    createView();

    await user.click(screen.getByLabelText('Remove test axis'));
    expect(changeXAxis).toHaveBeenLastCalledWith('');
    expect(changeXAxisSettings).toHaveBeenCalledWith({
      ...props.XAxisSettings,
      scale: 'linear',
    });
  });

  it('removes y-axis from display when we click Close on its label', async () => {
    const user = userEvent.setup();
    props.YAxis = 'test';
    createView();

    await user.click(screen.getByRole('tab', { name: 'Y' }));

    await user.click(screen.getByLabelText('Remove test axis'));
    expect(changeYAxis).toHaveBeenLastCalledWith('');
    expect(changeYAxesSettings).toHaveBeenCalledWith({
      ...props.YAxesSettings,
      scale: 'linear',
    });
  });

  it.todo('check we can select channels on y axis with both input boxes');

  it.todo('preserves axes selections when moving between tabs');
});
