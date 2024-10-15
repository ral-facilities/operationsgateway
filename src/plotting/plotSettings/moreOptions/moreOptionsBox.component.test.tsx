import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { SelectedPlotChannel } from '../../../app.types';
import { testPlotDatasets } from '../../../testUtils';
import { deepCopySelectedPlotChannels } from '../../util';
import type { MoreOptionsProps } from './moreOptionsBox.component';
import MoreOptionsBox from './moreOptionsBox.component';

describe('MoreOptionsBox', () => {
  let props: MoreOptionsProps;
  const changeSelectedPlotChannels = vi.fn();
  let user: UserEvent;

  const createView = (): RenderResult => {
    return render(<MoreOptionsBox {...props} />);
  };

  beforeEach(() => {
    const testSelectedPlotChannels: SelectedPlotChannel[] =
      testPlotDatasets.map((dataset, i) => ({
        name: dataset.name,
        units: 'mm',
        options: {
          visible: true,
          colour: `colour-${i.toString()}`,
          lineStyle: 'solid',
          lineWidth: 3,
          markerStyle: 'circle',
          markerSize: 3,
          yAxis: 'left',
        },
      }));

    props = {
      channel: testSelectedPlotChannels[1],
      selectedPlotChannels: testSelectedPlotChannels,
      changeSelectedPlotChannels,
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

  it('allows user to change line style of a channel', async () => {
    const expected = deepCopySelectedPlotChannels(props.selectedPlotChannels);
    expected[1].options.lineStyle = 'dashed';

    createView();

    const select = screen.getByLabelText(
      `change ${props.channel.name} line style`
    );
    fireEvent.change(select, { target: { value: 'dashed' } });
    expect(changeSelectedPlotChannels).toHaveBeenCalledWith(expected);
  });

  it('allows user to change marker style of a channel', async () => {
    const expected = deepCopySelectedPlotChannels(props.selectedPlotChannels);
    expected[1].options.markerStyle = 'cross';

    createView();

    const select = screen.getByLabelText(
      `change ${props.channel.name} marker style`
    );
    fireEvent.change(select, { target: { value: 'cross' } });
    expect(changeSelectedPlotChannels).toHaveBeenCalledWith(expected);
  });

  it('allows user to toggle channel visibility off', async () => {
    const expected = deepCopySelectedPlotChannels(props.selectedPlotChannels);
    expected[1].options.visible = false;

    createView();

    screen.getByRole('checkbox').click();
    fireEvent.change(screen.getByRole('checkbox'), { target: { checked: '' } });
    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith(expected);
  });

  it('allows user to toggle channel visibility on', async () => {
    const expected = deepCopySelectedPlotChannels(props.selectedPlotChannels);

    props.channel.options.visible = false;
    props.selectedPlotChannels[1].options.visible = false;
    createView();

    screen.getByRole('checkbox').click();
    fireEvent.change(screen.getByRole('checkbox'), { target: { checked: '' } });
    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith(expected);
  });

  it('allows user to change plot colour', async () => {
    const expected = deepCopySelectedPlotChannels(props.selectedPlotChannels);
    expected[1].options.colour = expect.anything();

    createView();

    await user.click(
      screen.getByLabelText(`Pick ${props.channel.name} colour`)
    );
    await user.click(screen.getByLabelText('Color'));

    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith(expected);
  });

  it('allows user to change width of the plot line', async () => {
    const expected = deepCopySelectedPlotChannels(props.selectedPlotChannels);
    expected[1].options.lineWidth = 5;

    createView();
    const input = screen.getByLabelText(
      `change ${props.channel.name} line width`
    );

    await user.type(input, '5');

    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith(expected);

    // Won't allow for input out of specified range (now 1-10)
    expected[1].options.lineWidth = 10;
    fireEvent.change(input, { target: { value: '11' } });
    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith(expected);

    expected[1].options.lineWidth = 1;
    fireEvent.change(input, { target: { value: '0' } });
    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith(expected);
  });

  it('allows user to change size of the marker', async () => {
    const expected = deepCopySelectedPlotChannels(props.selectedPlotChannels);
    expected[1].options.markerSize = 5;

    createView();
    const input = screen.getByLabelText(
      `change ${props.channel.name} marker size`
    );

    await user.type(input, '5');

    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith(expected);

    // Won't allow for input out of specified range (now 1-10)
    expected[1].options.markerSize = 10;
    fireEvent.change(input, { target: { value: '11' } });
    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith(expected);

    expected[1].options.markerSize = 1;
    fireEvent.change(input, { target: { value: '0' } });
    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith(expected);
  });

  it('allows user to switch channel axis', async () => {
    const expected = deepCopySelectedPlotChannels(props.selectedPlotChannels);
    expected[1].options.yAxis = 'right';

    createView();

    await user.click(
      within(screen.getByLabelText('Y Axis')).getByLabelText('Right')
    );

    expect(changeSelectedPlotChannels).toHaveBeenLastCalledWith(expected);
  });
});
