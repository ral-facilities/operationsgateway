import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { staticChannels } from '../../api/channels';
import { FullScalarChannelMetadata } from '../../app.types';
import { testScalarChannels } from '../../testUtils';
import { COLOUR_ORDER } from './colourGenerator';
import type { YAxisTabProps } from './yAxisTab.component';
import YAxisTab from './yAxisTab.component';

describe('y-axis tab', () => {
  let props: YAxisTabProps;
  let user: ReturnType<typeof userEvent.setup>;
  const changeLeftYAxisScale = jest.fn();
  const changeRightYAxisScale = jest.fn();
  const changeSelectedPlotChannels = jest.fn();
  const changeLeftYAxisMinimum = jest.fn();
  const changeLeftYAxisMaximum = jest.fn();
  const changeRightYAxisMinimum = jest.fn();
  const changeRightYAxisMaximum = jest.fn();
  const changeSelectedColours = jest.fn();
  const changeRemainingColours = jest.fn();
  const changeRightYAxisLabel = jest.fn();
  const changeLeftYAxisLabel = jest.fn();

  const createView = (): RenderResult => {
    return render(<YAxisTab {...props} />);
  };

  beforeEach(() => {
    props = {
      selectedRecordTableChannels: [
        staticChannels['timestamp'] as FullScalarChannelMetadata,
      ],
      allChannels: testScalarChannels,
      selectedPlotChannels: [],
      changeSelectedPlotChannels,
      changeLeftYAxisMinimum,
      changeLeftYAxisMaximum,
      changeRightYAxisMinimum,
      changeRightYAxisMaximum,
      leftYAxisScale: 'linear',
      rightYAxisScale: 'logarithmic',
      changeLeftYAxisScale,
      changeRightYAxisScale,
      initialSelectedColours: [],
      initialRemainingColours: COLOUR_ORDER.map((colour) => colour),
      changeSelectedColours,
      changeRemainingColours,
      changeRightYAxisLabel,
      changeLeftYAxisLabel,
    };

    user = userEvent.setup({ delay: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const { asFragment } = createView();

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with selected channels', () => {
    props.selectedPlotChannels = testScalarChannels.map((channel) => ({
      name: channel.systemName,
      displayName: channel.name,
      options: {
        visible: true,
        colour: '#ffffff',
        lineStyle: 'solid',
        yAxis: 'left',
      },
    }));

    createView();

    props.selectedPlotChannels.forEach((channel) => {
      const channelName = channel.displayName ?? channel.name;
      const channelLabel = screen.getByLabelText(`${channelName} label`);
      expect(within(channelLabel).getByText(channelName)).toBeInTheDocument();
      expect(
        within(channelLabel).getByLabelText(`More options for ${channelName}`)
      ).toBeInTheDocument();
      expect(
        within(channelLabel).getByLabelText(`Remove ${channelName} from plot`)
      ).toBeInTheDocument();
    });
  });

  it('renders Y scale radio buttons and calls changeLeftYAxisScale on click when the axis selected is the left', async () => {
    createView();

    const radioGroup = screen.getByRole('radiogroup', { name: 'Scale' });
    expect(
      within(radioGroup).getByRole('radio', {
        name: 'Linear',
      })
    ).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Log' }));

    expect(changeLeftYAxisScale).toHaveBeenCalledWith('logarithmic');
  });

  it('renders Y scale radio buttons and calls changeRightYAxisScale on click when the axis selected is the right', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Right' }));

    const radioGroup = screen.getByRole('radiogroup', { name: 'Scale' });
    expect(
      within(radioGroup).getByRole('radio', {
        name: 'Log',
      })
    ).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Linear' }));

    expect(changeRightYAxisScale).toHaveBeenCalledWith('linear');
  });

  it('allows user to add channels on the y-axis (keyboard only)', async () => {
    createView();

    const autocomplete = screen.getByRole('autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'Channel_');
    autocomplete.focus();
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    expect(changeSelectedPlotChannels).toHaveBeenCalledWith([
      {
        displayName: 'Channel_ABCDE',
        name: 'CHANNEL_ABCDE',
        units: '',
        options: {
          visible: true,
          colour: expect.anything(),
          lineStyle: 'solid',
          yAxis: 'left',
        },
      },
    ]);
  });

  it('allows user to add channels on the y-axis (mouse and keyboard)', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Right' }));

    const autocomplete = screen.getByRole('autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'Channel_');
    await user.click(screen.getByText('Channel_DEFGH'));

    expect(changeSelectedPlotChannels).toHaveBeenCalledWith([
      {
        displayName: 'Channel_DEFGH',
        name: 'CHANNEL_DEFGH',
        units: '',
        options: {
          visible: true,
          colour: expect.anything(),
          lineStyle: 'solid',
          yAxis: 'right',
        },
      },
    ]);
  });

  it('populates the displayed table channels dropdown and adds selection to the y-axis', async () => {
    props.selectedRecordTableChannels = testScalarChannels.filter(
      (channel) => channel.systemName === 'CHANNEL_ABCDE'
    );
    createView();

    const select = screen.getByLabelText('Displayed table channels');
    await userEvent.click(select);

    const dropdown = screen.getByRole('listbox', {
      name: 'Displayed table channels',
    });
    await userEvent.click(
      within(dropdown).getByRole('option', { name: 'Channel_ABCDE' })
    );

    expect(changeSelectedPlotChannels).toHaveBeenCalledWith([
      {
        name: 'CHANNEL_ABCDE',
        displayName: 'Channel_ABCDE',
        options: {
          visible: true,
          colour: expect.anything(),
          lineStyle: 'solid',
          yAxis: 'left',
        },
      },
    ]);
  });

  it('only populates the displayed table channels dropdown with options not already selected', async () => {
    props.selectedRecordTableChannels = testScalarChannels.filter(
      (channel) => channel.systemName === 'CHANNEL_ABCDE'
    );
    props.selectedPlotChannels = [
      {
        name: 'CHANNEL_ABCDE',
        displayName: 'Channel_ABCDE',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
          yAxis: 'left',
        },
      },
    ];
    createView();

    const select = screen.getByLabelText('Displayed table channels');
    await userEvent.click(select);

    const dropdown = screen.getByRole('listbox', {
      name: 'Displayed table channels',
    });
    expect(within(dropdown).queryByRole('option')).not.toBeInTheDocument();
  });

  it('removes channel from display when we click Close on its label', async () => {
    props.selectedPlotChannels = [
      {
        name: 'CHANNEL_ABCDE',
        displayName: 'Channel_ABCDE',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
          yAxis: 'left',
        },
      },
      {
        name: 'CHANNEL_DEFGH',
        displayName: 'Channel_DEFGH',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
          yAxis: 'left',
        },
      },
    ];
    createView();

    await user.click(screen.getByLabelText('Remove Channel_ABCDE from plot'));
    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith([
      {
        name: 'CHANNEL_DEFGH',
        displayName: 'Channel_DEFGH',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
          yAxis: 'left',
        },
      },
    ]);
    expect(changeLeftYAxisScale).not.toHaveBeenCalled();
    expect(changeRightYAxisScale).not.toHaveBeenCalled();
  });

  it('removes channel from display when we click Close on its label and resets y-axis scale to linear if no selected channels remain', async () => {
    props.selectedPlotChannels = [
      {
        name: 'CHANNEL_ABCDE',
        displayName: 'Channel_ABCDE',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
          yAxis: 'left',
        },
      },
    ];
    createView();

    await user.click(screen.getByLabelText('Remove Channel_ABCDE from plot'));
    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith([]);
    expect(changeLeftYAxisScale).toHaveBeenCalledWith('linear');
    expect(changeRightYAxisScale).toHaveBeenCalledWith('linear');
  });

  describe('min and max fields', () => {
    it('lets user change the min field and calls relevant onchange method', async () => {
      createView();

      const minField = screen.getByLabelText('Min');
      await user.type(minField, '0');
      expect(changeLeftYAxisMinimum).toHaveBeenCalledWith(0);
    });

    it('lets user change the max field and calls relevant onchange method', async () => {
      createView();

      await user.click(screen.getByRole('button', { name: 'Right' }));

      const maxField = screen.getByLabelText('Max');
      await user.type(maxField, '0');
      expect(changeRightYAxisMaximum).toHaveBeenCalledWith(0);
    });

    it('sets minimum value to undefined if no float value is present', async () => {
      createView();

      await user.click(screen.getByRole('button', { name: 'Right' }));

      const minField = screen.getByLabelText('Min');
      await user.type(minField, '1');
      expect(changeRightYAxisMinimum).toHaveBeenLastCalledWith(1);

      await user.clear(minField);
      expect(changeRightYAxisMinimum).toHaveBeenLastCalledWith(undefined);
    });

    it('sets maximum value to undefined if no float value is present', async () => {
      createView();

      const maxField = screen.getByLabelText('Max');
      await user.type(maxField, '1');
      expect(changeLeftYAxisMaximum).toHaveBeenLastCalledWith(1);

      await user.clear(maxField);
      expect(changeLeftYAxisMaximum).toHaveBeenLastCalledWith(undefined);
    });

    it('displays helper text when min and max fields contain an invalid range', async () => {
      createView();

      const minField = screen.getByLabelText('Min');
      const maxField = screen.getByLabelText('Max');
      await user.type(minField, '2');
      await user.type(maxField, '1');

      // Check the helper text displays
      screen.getAllByText('Invalid range');

      // One for each input box
      expect(screen.getAllByText('Invalid range').length).toEqual(2);
    });

    it('initialises correctly with falsy values', async () => {
      props.initialLeftYAxisMinimum = 0;
      props.initialLeftYAxisMaximum = 0;
      createView();

      const minField = screen.getByLabelText('Min');
      expect(minField).toHaveValue('0');

      const maxField = screen.getByLabelText('Max');
      expect(maxField).toHaveValue('0');
    });
  });

  it('allows customization of left y-axis label', async () => {
    function TestEnv() {
      const [leftYAxisLabel, setLeftYAxisLabel] = React.useState('');
      return (
        <YAxisTab
          {...props}
          leftYAxisLabel={leftYAxisLabel}
          changeLeftYAxisLabel={setLeftYAxisLabel}
        />
      );
    }

    render(<TestEnv />);

    const axisLabelTextBox = screen.getByRole('textbox', { name: 'Label' });
    expect(axisLabelTextBox).toHaveValue('');

    await user.type(axisLabelTextBox, 'Left axis');
    expect(axisLabelTextBox).toHaveValue('Left axis');
  });

  it('allows customization of right y-axis label', async () => {
    function TestEnv() {
      const [rightYAxisLabel, setRightYAxisLabel] = React.useState('');
      return (
        <YAxisTab
          {...props}
          leftYAxisLabel={rightYAxisLabel}
          changeLeftYAxisLabel={setRightYAxisLabel}
        />
      );
    }

    render(<TestEnv />);

    const axisLabelTextBox = screen.getByRole('textbox', { name: 'Label' });
    expect(axisLabelTextBox).toHaveValue('');

    await user.type(axisLabelTextBox, 'Right axis');
    expect(axisLabelTextBox).toHaveValue('Right axis');
  });
});
