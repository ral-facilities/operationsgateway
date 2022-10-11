import React from 'react';
import MoreOptionsBox from './moreOptionsBox.component';
import type { MoreOptionsProps } from './moreOptionsBox.component';
import { fireEvent, render, screen } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { testPlotDatasets } from '../../../setupTests';

describe('MoreOptionsBox', () => {
  let props: MoreOptionsProps;
  const changeSelectedPlotChannels = jest.fn();
  let user;

  const createView = (): RenderResult => {
    return render(<MoreOptionsBox {...props} />);
  };

  beforeEach(() => {
    props = {
      channel: {
        name: testPlotDatasets[1].name,
        options: {
          visible: true,
          colour: 'colour-1',
          lineStyle: 'solid',
        },
      },
      selectedPlotChannels: testPlotDatasets.map((dataset, i) => ({
        name: dataset.name,
        options: {
          visible: true,
          colour: `colour-${i.toString()}`,
          lineStyle: 'solid',
        },
      })),
      changeSelectedPlotChannels,
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

  it('allows user to change line style of a channel', async () => {
    const expected = testPlotDatasets.map((dataset, i) => ({
      name: dataset.name,
      options: {
        visible: true,
        colour: `colour-${i.toString()}`,
        lineStyle: i === 1 ? 'dashed' : 'solid',
      },
    }));

    createView();

    const select = screen.getByLabelText(
      `change ${props.channel.name} line style`
    );
    fireEvent.change(select, { target: { value: 'dashed' } });
    expect(changeSelectedPlotChannels).toHaveBeenCalledWith(expected);
  });

  it('allows user to toggle channel visibility off', async () => {
    const expected = testPlotDatasets.map((dataset, i) => ({
      name: dataset.name,
      options: {
        visible: i === 1 ? false : true,
        colour: `colour-${i.toString()}`,
        lineStyle: 'solid',
      },
    }));

    createView();

    screen.getByRole('checkbox').click();
    fireEvent.change(screen.getByRole('checkbox'), { target: { checked: '' } });
    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith(expected);
  });

  it('allows user to toggle channel visibility on', async () => {
    const expected = testPlotDatasets.map((dataset, i) => ({
      name: dataset.name,
      options: {
        visible: true,
        colour: `colour-${i.toString()}`,
        lineStyle: 'solid',
      },
    }));

    props.channel.options.visible = false;
    props.selectedPlotChannels[1].options.visible = false;
    createView();

    screen.getByRole('checkbox').click();
    fireEvent.change(screen.getByRole('checkbox'), { target: { checked: '' } });
    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith(expected);
  });

  it('allows user to change plot colour', async () => {
    const expected = testPlotDatasets.map((dataset, i) => ({
      name: dataset.name,
      options: {
        visible: true,
        colour: i === 1 ? expect.anything() : `colour-${i.toString()}`,
        lineStyle: 'solid',
      },
    }));

    createView();

    await user.click(
      screen.getByLabelText(`Pick ${props.channel.name} colour`)
    );
    await user.click(screen.getByLabelText('Color'));

    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith(expected);
  });
});
