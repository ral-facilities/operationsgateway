import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColourPicker from './colourPicker.component';

describe('ColourPicker component', () => {
  const props: React.ComponentProps<typeof ColourPicker> = {
    colour: '#ff0000',
    onChange: jest.fn(),
  };

  it('renders coloured square when popover is not open', () => {
    const view = render(<ColourPicker {...props} />);
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders colour picker when square is clicked', async () => {
    const user = userEvent.setup();
    const view = render(<ColourPicker {...props} />);

    await user.click(screen.getByLabelText('Pick colour'));

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('calls onChange when new colour is picked', async () => {
    const user = userEvent.setup();
    render(<ColourPicker {...props} />);

    await user.click(screen.getByLabelText('Pick colour'));

    await user.click(screen.getByLabelText('Color'));

    expect(props.onChange).toHaveBeenCalled();
  });

  it('closes colour picker only when you click outside of it', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <div>Outside</div>
        <ColourPicker {...props} />
      </div>
    );

    await user.click(screen.getByLabelText('Pick colour'));

    screen.getByLabelText('Color');

    // don't think this could actually occur with a real mouse, but oh well
    fireEvent.mouseDown(screen.getByLabelText('Pick colour'));
    fireEvent.click(screen.getByLabelText('Color'));

    screen.getByLabelText('Color');

    await user.click(screen.getByText('Outside'));

    expect(screen.queryByLabelText('Color')).not.toBeInTheDocument();
  });

  it('closes colour picker when you click the square', async () => {
    const user = userEvent.setup();
    render(<ColourPicker {...props} />);

    await user.click(screen.getByLabelText('Pick colour'));

    screen.getByLabelText('Color');

    await user.click(screen.getByLabelText('Pick colour'));

    expect(screen.queryByLabelText('Color')).not.toBeInTheDocument();
  });
});
