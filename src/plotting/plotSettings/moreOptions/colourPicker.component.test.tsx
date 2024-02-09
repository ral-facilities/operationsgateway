import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColourPicker from './colourPicker.component';

describe('ColourPicker component', () => {
  const props: React.ComponentProps<typeof ColourPicker> = {
    channelName: 'CHANNEL_1',
    colour: '#ff0000',
    changeColour: jest.fn(),
  };

  it('renders coloured square when popover is not open', () => {
    const view = render(<ColourPicker {...props} />);
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders colour picker when square is clicked', async () => {
    const user = userEvent.setup();
    const view = render(<ColourPicker {...props} />);

    await user.click(screen.getByLabelText(`Pick ${props.channelName} colour`));

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders marker colour picker when marker prop is true', async () => {
    const user = userEvent.setup();
    const view = render(<ColourPicker {...props} marker={true} />);

    await user.click(
      screen.getByLabelText(`Pick ${props.channelName} marker colour`)
    );

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('toggles lockColour state when the Same as line switch is clicked', async () => {
    const user = userEvent.setup();
    render(<ColourPicker {...props} marker={true} />);

    await user.click(
      screen.getByLabelText(`Pick ${props.channelName} marker colour`)
    );

    const switchElement = screen.getByRole('checkbox');

    await user.click(switchElement);

    expect(switchElement).toHaveProperty('checked', true);

    await user.click(switchElement);

    expect(switchElement).toHaveProperty('checked', false);
  });

  it('calls changeColour with the same colour when Same as line switch is toggled', async () => {
    const user = userEvent.setup();
    render(<ColourPicker {...props} marker={true} sameAsLine={true} />);

    await user.click(
      screen.getByLabelText(`Pick ${props.channelName} marker colour`)
    );

    const switchElement = screen.getByRole('checkbox');
    await user.click(switchElement);

    expect(props.changeColour).toHaveBeenCalledWith(props.colour);

    await user.click(switchElement);

    expect(props.changeColour).toHaveBeenCalledWith('');
  });

  it('calls changeColour when new colour is picked', async () => {
    const user = userEvent.setup();
    render(<ColourPicker {...props} />);

    await user.click(screen.getByLabelText(`Pick ${props.channelName} colour`));

    await user.click(screen.getByLabelText('Color'));

    expect(props.changeColour).toHaveBeenCalledWith(expect.anything());
  });

  it('closes colour picker only when you click outside of it', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <div>Outside</div>
        <ColourPicker {...props} />
      </div>
    );

    await user.click(screen.getByLabelText(`Pick ${props.channelName} colour`));

    screen.getByLabelText('Color');

    // don't think this could actually occur with a real mouse, but oh well
    fireEvent.mouseDown(
      screen.getByLabelText(`Pick ${props.channelName} colour`)
    );
    fireEvent.click(screen.getByLabelText('Color'));

    screen.getByLabelText('Color');

    await user.click(screen.getByText('Outside'));

    expect(screen.queryByLabelText('Color')).not.toBeInTheDocument();
  });

  it('closes colour picker when you click the square', async () => {
    const user = userEvent.setup();
    render(<ColourPicker {...props} />);

    await user.click(screen.getByLabelText(`Pick ${props.channelName} colour`));

    screen.getByLabelText('Color');

    await user.click(screen.getByLabelText(`Pick ${props.channelName} colour`));

    expect(screen.queryByLabelText('Color')).not.toBeInTheDocument();
  });
});
