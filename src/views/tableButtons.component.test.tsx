import { render, screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import React from 'react';
import TableButtons from './tableButtons.component';

describe('Table buttons', () => {
  const openFilters = vi.fn();
  const openFunctions = vi.fn();
  const openChannels = vi.fn();
  const toggleSearchExpanded = vi.fn();

  let user: UserEvent;
  let props: React.ComponentProps<typeof TableButtons>;

  const createView = () => {
    return render(<TableButtons {...props} />);
  };

  beforeEach(() => {
    user = userEvent.setup();
    props = {
      openFilters,
      openFunctions,
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

  it('calls openFunctions when the functions button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Functions' }));
    expect(openFunctions).toHaveBeenCalled();
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
