import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YAxisTab from './yAxisTab.component';
import type { YAxisTabProps } from './yAxisTab.component';
import { testChannels } from '../../setupTests';
import { FullScalarChannelMetadata } from '../../app.types';
import { COLOUR_ORDER } from './colourGenerator';

describe('y-axis tab', () => {
  let props: YAxisTabProps;
  let user;
  const changeYAxesScale = jest.fn();
  const changeSelectedPlotChannels = jest.fn();
  const changeYMinimum = jest.fn();
  const changeYMaximum = jest.fn();
  const changeSelectedColours = jest.fn();
  const changeRemainingColours = jest.fn();

  const createView = (): RenderResult => {
    return render(<YAxisTab {...props} />);
  };

  beforeEach(() => {
    props = {
      selectedRecordTableChannels: [
        {
          systemName: 'timestamp',
          channel_dtype: 'scalar',
          userFriendlyName: 'Time',
        },
      ],
      allChannels: testChannels as FullScalarChannelMetadata[],
      selectedPlotChannels: [],
      changeSelectedPlotChannels,
      changeYMinimum,
      changeYMaximum,
      YAxesScale: 'linear',
      changeYAxesScale,
      initialSelectedColours: [],
      initialRemainingColours: COLOUR_ORDER.map((colour) => colour),
      changeSelectedColours,
      changeRemainingColours,
    };

    user = userEvent.setup({ delay: null });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { asFragment } = createView();

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with selected channels', () => {
    props.selectedPlotChannels = testChannels.map((channel) => ({
      name: channel.systemName,
      options: {
        visible: true,
        colour: '#ffffff',
        lineStyle: 'solid',
        yAxis: 'left',
      },
    }));

    createView();

    props.selectedPlotChannels.forEach((channel) => {
      const channelLabel = screen.getByLabelText(`${channel.name} label`);
      expect(within(channelLabel).getByText(channel.name)).toBeInTheDocument();
      expect(
        within(channelLabel).getByLabelText(`More options for ${channel.name}`)
      ).toBeInTheDocument();
      expect(
        within(channelLabel).getByLabelText(`Remove ${channel.name} from plot`)
      ).toBeInTheDocument();
    });
  });

  it('renders Y scale radio buttons and calls changeYAxesScale on click', async () => {
    createView();

    const radioGroup = screen.getByRole('radiogroup', { name: 'Scale' });
    expect(
      within(radioGroup).getByRole('radio', {
        name: 'Linear',
      })
    ).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Log' }));

    expect(changeYAxesScale).toHaveBeenCalledWith('logarithmic');
  });

  it('allows user to add channels on the y-axis (keyboard only)', async () => {
    createView();

    const autocomplete = screen.getByRole('autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'test_');
    autocomplete.focus();
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    expect(changeSelectedPlotChannels).toHaveBeenCalledWith([
      {
        name: 'test_1',
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

    const autocomplete = screen.getByRole('autocomplete');
    const input = within(autocomplete).getByRole('combobox');

    await user.type(input, 'test_');
    await user.click(screen.getByText('test_1'));

    expect(changeSelectedPlotChannels).toHaveBeenCalledWith([
      {
        name: 'test_1',
        options: {
          visible: true,
          colour: expect.anything(),
          lineStyle: 'solid',
          yAxis: 'left',
        },
      },
    ]);
  });

  it('populates the displayed table channels dropdown and adds selection to the y-axis', async () => {
    props.selectedRecordTableChannels = [
      {
        systemName: 'test_1',
        channel_dtype: 'scalar',
      },
    ];
    createView();

    const select = screen.getByTestId('select displayed table channels');
    fireEvent.change(select, { target: { value: 'test_1' } });

    expect(changeSelectedPlotChannels).toHaveBeenCalledWith([
      {
        name: 'test_1',
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
    props.selectedRecordTableChannels = [
      {
        systemName: 'test_1',
        channel_dtype: 'scalar',
      },
    ];
    props.selectedPlotChannels = [
      {
        name: 'test_1',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
          yAxis: 'left',
        },
      },
    ];
    createView();

    const select = screen.getByTestId('select displayed table channels');
    fireEvent.change(select, { target: { value: 'test_1' } });

    expect(changeSelectedPlotChannels).not.toHaveBeenCalled();
  });

  it('removes channel from display when we click Close on its label', async () => {
    props.selectedPlotChannels = [
      {
        name: 'test_1',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
          yAxis: 'left',
        },
      },
      {
        name: 'test_2',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
          yAxis: 'left',
        },
      },
    ];
    createView();

    await user.click(screen.getByLabelText('Remove test_1 from plot'));
    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith([
      {
        name: 'test_2',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
          yAxis: 'left',
        },
      },
    ]);
    expect(changeYAxesScale).not.toHaveBeenCalled();
  });

  it('removes channel from display when we click Close on its label and resets y-axis scale to linear if no selected channels remain', async () => {
    props.selectedPlotChannels = [
      {
        name: 'test_1',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
          yAxis: 'left',
        },
      },
    ];
    createView();

    await user.click(screen.getByLabelText('Remove test_1 from plot'));
    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith([]);
    expect(changeYAxesScale).toHaveBeenCalledWith('linear');
  });

  describe('min and max fields', () => {
    it('lets user change the min field and calls relevant onchange method', async () => {
      createView();

      const minField = screen.getByLabelText('Min');
      await user.type(minField, '1');
      expect(changeYMinimum).toHaveBeenCalledWith(1);
    });

    it('lets user change the max field and calls relevant onchange method', async () => {
      createView();

      const maxField = screen.getByLabelText('Max');
      await user.type(maxField, '1');
      expect(changeYMaximum).toHaveBeenCalledWith(1);
    });

    it('sets minimum value to undefined if no float value is present', async () => {
      createView();

      const minField = screen.getByLabelText('Min');
      await user.type(minField, '1');
      expect(changeYMinimum).toHaveBeenLastCalledWith(1);

      await user.clear(minField);
      expect(changeYMinimum).toHaveBeenLastCalledWith(undefined);
    });

    it('sets maximum value to undefined if no float value is present', async () => {
      createView();

      const maxField = screen.getByLabelText('Max');
      await user.type(maxField, '1');
      expect(changeYMaximum).toHaveBeenLastCalledWith(1);

      await user.clear(maxField);
      expect(changeYMaximum).toHaveBeenLastCalledWith(undefined);
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
  });
});
