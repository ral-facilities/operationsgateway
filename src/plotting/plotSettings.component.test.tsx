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
      XAxisSettings: { scale: 'time' },
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
  });

  it('allows user to select an x-axis (mouse and keyboard)', async () => {
    const user = userEvent.setup();
    createView();

    let autocomplete = screen.getByRole('autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'CHANNEL');
    await user.click(screen.getByText('CHANNEL_1'));

    expect(changeXAxis).toHaveBeenCalledWith('CHANNEL_1');
  });

  it.todo('renders correctly with Y tab in view');
});
