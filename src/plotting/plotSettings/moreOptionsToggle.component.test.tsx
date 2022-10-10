import React from 'react';
import MoreOptionsToggle from './moreOptionsToggle.component';
import type { MoreOptionsProps } from './moreOptions.component';
import { testPlotDatasets } from '../../setupTests';
import { SelectedPlotChannel } from '../../app.types';
import { render, screen } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('./moreOptions.component', () => (props) => (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <mock-moreOptions data-testid="mock-moreOptions">
    {Object.entries(props).map(
      ([propName, propValue]) =>
        `${propName}=${JSON.stringify(propValue, null, 2)}\n`
    )}
    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
    {/* @ts-ignore */}
  </mock-moreOptions>
));

describe('MoreOptionsToggle', () => {
  let props: MoreOptionsProps;
  const changeSelectedPlotChannels = jest.fn();
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
    jest.clearAllMocks();
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

    expect(screen.queryByTestId('mock-moreOptions')).not.toBeInTheDocument();
  });
});
