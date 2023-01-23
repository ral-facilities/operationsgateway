import React from 'react';
import TableButtons from './tableButtons.component';
import { render, screen } from '@testing-library/react';
import axios from 'axios';
import userEvent from '@testing-library/user-event';

describe('Table buttons', () => {
  const openFilters = jest.fn();
  const openChannels = jest.fn();
  const toggleSearchExpanded = jest.fn();

  let user;
  let props: React.ComponentProps<typeof TableButtons>;

  const createView = () => {
    return render(<TableButtons {...props} />);
  };

  beforeEach(() => {
    user = userEvent.setup();
    (axios.get as jest.Mock).mockResolvedValue({ data: [] });
    props = {
      openFilters,
      openChannels,
      toggleSearchExpanded,
      searchExpanded: false,
    };
  });

  it('renders the buttons', async () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('calls openFilters when the filters button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(openFilters).toHaveBeenCalled();
  });

  it('calls openChannels when the data channels button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Data Channels' }));
    expect(openChannels).toHaveBeenCalled();
  });

  it('calls toggleSearchExpanded when the show/hide search button is clicked', async () => {
    // set this to true to test that the button name changes from the one we have in the snapshot
    props.searchExpanded = true;
    createView();

    await user.click(screen.getByRole('button', { name: 'Hide search' }));
    expect(toggleSearchExpanded).toHaveBeenCalled();
  });
});
