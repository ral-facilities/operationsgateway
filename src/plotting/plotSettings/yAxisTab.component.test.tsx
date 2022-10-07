import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YAxisTab, { ColourGenerator } from './yAxisTab.component';
import type { YAxisTabProps } from './yAxisTab.component';
import { testChannels } from '../../setupTests';
import { FullScalarChannelMetadata } from '../../app.types';

describe('y-axis tab', () => {
  let props: YAxisTabProps;
  let user;
  const changeYAxesScale = jest.fn();
  const changeSelectedPlotChannels = jest.fn();
  const changeYMinimum = jest.fn();
  const changeYMaximum = jest.fn();

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
        },
      },
    ];
    createView();

    const select = screen.getByTestId('select displayed table channels');
    fireEvent.change(select, { target: { value: 'test_1' } });

    expect(changeSelectedPlotChannels).not.toHaveBeenCalled();
  });

  it('allows user to toggle visibility of a selected channel off', async () => {
    props.selectedPlotChannels = [
      {
        name: 'test_1',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
        },
      },
    ];
    createView();

    await user.click(screen.getByLabelText('Toggle test_1 visibility off'));
    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith([
      {
        name: 'test_1',
        options: {
          visible: false,
          colour: '#ffffff',
          lineStyle: 'solid',
        },
      },
    ]);
  });

  it('allows user to toggle visibility of a selected channel on', async () => {
    props.selectedPlotChannels = [
      {
        name: 'test_1',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
        },
      },
      {
        name: 'test_2',
        options: {
          visible: false,
          colour: '#ffffff',
          lineStyle: 'solid',
        },
      },
    ];
    createView();

    await user.click(screen.getByLabelText('Toggle test_2 visibility on'));
    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith([
      {
        name: 'test_1',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
        },
      },
      {
        name: 'test_2',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
        },
      },
    ]);
  });

  it('allows user to change plot colour of a channel', async () => {
    props.selectedPlotChannels = [
      {
        name: 'test_1',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
        },
      },
      {
        name: 'test_2',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
        },
      },
    ];
    createView();

    await user.click(screen.getByLabelText('Pick test_2 colour'));
    await user.click(screen.getByLabelText('Color'));

    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith([
      {
        name: 'test_1',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
        },
      },
      {
        name: 'test_2',
        options: {
          visible: true,
          colour: expect.anything(),
          lineStyle: 'solid',
        },
      },
    ]);
  });

  it('allows user to change line style of a channel', async () => {
    props.selectedPlotChannels = [
      {
        name: 'test_1',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
        },
      },
      {
        name: 'test_2',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
        },
      },
    ];
    createView();

    await user.click(screen.getByLabelText('Change test_2 line style'));
    expect(changeSelectedPlotChannels).toHaveBeenCalledWith([
      {
        name: 'test_1',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
        },
      },
      {
        name: 'test_2',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'dashed',
        },
      },
    ]);
    await user.click(screen.getByLabelText('Change test_2 line style'));
    expect(changeSelectedPlotChannels).toHaveBeenCalledWith([
      {
        name: 'test_1',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
        },
      },
      {
        name: 'test_2',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'dotted',
        },
      },
    ]);
    await user.click(screen.getByLabelText('Change test_2 line style'));
    expect(changeSelectedPlotChannels).toHaveBeenCalledWith([
      {
        name: 'test_1',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
        },
      },
      {
        name: 'test_2',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
        },
      },
    ]);
  });

  it('removes channel from display when we click Close on its label', async () => {
    props.selectedPlotChannels = [
      {
        name: 'test_1',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
        },
      },
      {
        name: 'test_2',
        options: {
          visible: true,
          colour: '#ffffff',
          lineStyle: 'solid',
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
