import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import PlotSettings, {
  PlotSettingsProps,
  ColourGenerator,
} from './plotSettings.component';
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
      scale: 'log',
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
      scale: 'log',
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
          colour: expect.anything(),
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
          colour: expect.anything(),
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
          colour: '#ffffff',
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
          colour: '#ffffff',
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
          colour: '#ffffff',
        },
      },
      {
        name: 'CHANNEL_2',
        options: {
          visible: false,
          colour: '#ffffff',
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
          colour: '#ffffff',
        },
      },
      {
        name: 'CHANNEL_2',
        options: {
          visible: true,
          colour: '#ffffff',
        },
      },
    ]);
  });

  it('allows user to change plot colour of a channel', async () => {
    props.selectedChannels = [
      {
        name: 'CHANNEL_1',
        options: {
          visible: true,
          colour: '#ffffff',
        },
      },
      {
        name: 'CHANNEL_2',
        options: {
          visible: true,
          colour: '#ffffff',
        },
      },
    ];
    createView();

    await user.click(screen.getByRole('tab', { name: 'Y' }));

    await user.click(screen.getByLabelText('Pick CHANNEL_2 colour'));
    await user.click(screen.getByLabelText('Color'));

    expect(changeSelectedChannels).toHaveBeenLastCalledWith([
      {
        name: 'CHANNEL_1',
        options: {
          visible: true,
          colour: '#ffffff',
        },
      },
      {
        name: 'CHANNEL_2',
        options: {
          visible: true,
          colour: expect.anything(),
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
          colour: '#ffffff',
        },
      },
      {
        name: 'CHANNEL_2',
        options: {
          visible: true,
          colour: '#ffffff',
        },
      },
    ];
    createView();

    await user.click(screen.getByRole('tab', { name: 'Y' }));

    await user.click(screen.getByLabelText('Remove CHANNEL_1 from y-axis'));
    expect(changeSelectedChannels).toHaveBeenLastCalledWith([
      {
        name: 'CHANNEL_2',
        options: {
          visible: true,
          colour: '#ffffff',
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
          colour: '#ffffff',
        },
      },
    ];
    createView();

    await user.click(screen.getByRole('tab', { name: 'Y' }));

    await user.click(screen.getByLabelText('Remove CHANNEL_1 from y-axis'));
    expect(changeSelectedChannels).toHaveBeenLastCalledWith([]);
    expect(changeYAxesSettings).toHaveBeenCalledWith({
      ...props.YAxesSettings,
      scale: 'linear',
    });
  });
});

describe('ColourGenerator', () => {
  let colourGenerator;
  const colourOrder = [
    '#008000', // dark green
    '#0000ff', // dark blue
    '#ff00ff', // pink
    '#00ffff', // light blue
    '#008080', // teal
    '#800000', // deep red
    '#00ff00', // light green
    '#000080', // navy blue
    '#7f8000', // brown-ish yellow?
    '#80007f', // indigo
  ];

  beforeEach(() => {
    colourGenerator = new ColourGenerator();
  });

  describe('getting next colour', () => {
    it('returns the next colour in the remaining colours list', () => {
      const colour = colourGenerator.nextColour();
      expect(colour).toEqual(colourOrder[0]);
    });

    it('returns a random colour if the list of remaining colours is empty', () => {
      colourOrder.forEach(() => {
        colourGenerator.nextColour();
      });
      const colour = colourGenerator.nextColour();
      expect(colourOrder.includes(colour)).toBeFalsy();
    });
  });

  describe('removing a colour', () => {
    it('1 colour selected', () => {
      const firstGenerated = colourGenerator.nextColour();

      colourGenerator.removeColour(firstGenerated);

      const secondGenerated = colourGenerator.nextColour();
      expect(firstGenerated).toEqual(secondGenerated);
    });

    describe('2 colours selected', () => {
      it('removes first', () => {
        const firstGenerated = colourGenerator.nextColour();
        colourGenerator.nextColour();

        colourGenerator.removeColour(firstGenerated);

        const thirdGenerated = colourGenerator.nextColour();
        expect(thirdGenerated).toEqual(firstGenerated);
      });

      it('removes second', () => {
        colourGenerator.nextColour();
        const secondGenerated = colourGenerator.nextColour();

        colourGenerator.removeColour(secondGenerated);

        const thirdGenerated = colourGenerator.nextColour();
        expect(thirdGenerated).toEqual(secondGenerated);
      });
    });

    describe('3 colours selected', () => {
      it('removes first', () => {
        const firstGenerated = colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();

        colourGenerator.removeColour(firstGenerated);

        const fourthGenerated = colourGenerator.nextColour();
        expect(fourthGenerated).toEqual(firstGenerated);
      });

      it('removes middle', () => {
        colourGenerator.nextColour();
        const secondGenerated = colourGenerator.nextColour();
        colourGenerator.nextColour();

        colourGenerator.removeColour(secondGenerated);

        const fourthGenerated = colourGenerator.nextColour();
        expect(fourthGenerated).toEqual(secondGenerated);
      });

      it('removes last', () => {
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        const thirdGenerated = colourGenerator.nextColour();

        colourGenerator.removeColour(thirdGenerated);

        const fourthGenerated = colourGenerator.nextColour();
        expect(fourthGenerated).toEqual(thirdGenerated);
      });
    });

    describe('10 colours selected', () => {
      it('removes first', () => {
        const firstGenerated = colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();

        colourGenerator.removeColour(firstGenerated);

        const fourthGenerated = colourGenerator.nextColour();
        expect(fourthGenerated).toEqual(firstGenerated);
      });

      it('removes some middle ones', () => {
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        const thirdGenerated = colourGenerator.nextColour();
        colourGenerator.nextColour();
        const fifthGenerated = colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        const ninthGenerated = colourGenerator.nextColour();
        colourGenerator.nextColour();

        // Remove third, then ninth, then fifth
        colourGenerator.removeColour(thirdGenerated);
        colourGenerator.removeColour(ninthGenerated);
        colourGenerator.removeColour(fifthGenerated);

        const eleventhGenerated = colourGenerator.nextColour();
        const twelfthGenerated = colourGenerator.nextColour();
        const thirteenthGenerated = colourGenerator.nextColour();
        expect(eleventhGenerated).toEqual(thirdGenerated);
        expect(twelfthGenerated).toEqual(fifthGenerated);
        expect(thirteenthGenerated).toEqual(ninthGenerated);
      });

      it('removes last', () => {
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        const tenthGenerated = colourGenerator.nextColour();

        colourGenerator.removeColour(tenthGenerated);

        const eleventhGenerated = colourGenerator.nextColour();
        expect(eleventhGenerated).toEqual(tenthGenerated);
      });
    });

    describe('11 colours selected', () => {
      it('removes last', () => {
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        colourGenerator.nextColour();
        const eleventhGenerated = colourGenerator.nextColour();

        colourGenerator.removeColour(eleventhGenerated);

        // No more colours in remaining colours list, so we expect a random colour
        const twelfthGenerated = colourGenerator.nextColour();
        expect(twelfthGenerated).not.toEqual(eleventhGenerated);
      });
    });
  });
});
