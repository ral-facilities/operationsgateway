import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectedPlotChannel } from '../../../app.types';
import { testPlotDatasets } from '../../../testUtils';
import type { MoreOptionsProps } from './moreOptionsBox.component';
import MoreOptionsToggle from './moreOptionsToggle.component';

vi.mock('./moreOptionsBox.component', () => {
  return {
    default: (props) => (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      <mock-moreOptionsBox data-testid="mock-moreOptionsBox">
        {Object.entries(props).map(
          ([propName, propValue]) =>
            `${propName}=${JSON.stringify(propValue, null, 2)}\n`
        )}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
      </mock-moreOptionsBox>
    ),
  };
});

describe('MoreOptionsToggle', () => {
  let props: MoreOptionsProps;
  const changeSelectedPlotChannels = vi.fn();
  let user;

  const createView = (): RenderResult => {
    return render(<MoreOptionsToggle {...props} />);
  };

  const testSelectedPlotChannels: SelectedPlotChannel[] = testPlotDatasets.map(
    (dataset, i) => ({
      name: dataset.name,
      options: {
        visible: true,
        colour: `colour-${i.toString()}`,
        lineStyle: 'solid',
        yAxis: 'left',
      },
    })
  );

  beforeEach(() => {
    props = {
      channel: testSelectedPlotChannels[0],
      selectedPlotChannels: testSelectedPlotChannels,
      changeSelectedPlotChannels,
    };

    user = userEvent.setup({ delay: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when options box not open', () => {
    const { asFragment } = createView();
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when options box open and passes all props to the child component', async () => {
    const { asFragment } = createView();

    await user.click(
      screen.getByLabelText(`More options for ${props.channel.name}`)
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('closes options box when you click outside of it', async () => {
    render(
      <div>
        <div>Outside</div>
        <MoreOptionsToggle {...props} />
      </div>
    );

    await user.click(
      screen.getByLabelText(`More options for ${props.channel.name}`)
    );

    await user.click(screen.getByText('Outside'));

    expect(screen.queryByTestId('mock-moreOptionsBox')).not.toBeInTheDocument();
  });
});
