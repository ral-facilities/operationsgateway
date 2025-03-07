import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { renderComponentWithProviders } from '../../testUtils';
import UsersTable from './usersTable.component'; // Update with the correct path

describe('UsersTable Snapshot', () => {
  let user: UserEvent;
  const createView = () => {
    return renderComponentWithProviders(<UsersTable />);
  };

  beforeEach(() => {
    user = userEvent.setup();
  });
  it('matches snapshot', () => {
    const { asFragment } = createView();
    expect(asFragment()).toMatchSnapshot();
  });

  it('opens add dialog and closes it correctly', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: 'Add User' });
    await user.click(addButton);

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: 'Add User' })
      ).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Add User' })
      ).not.toBeInTheDocument();
    });
  });

  it('opens change password dialog and closes it correctly', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button', { name: 'Row Actions' });
    await user.click(addButtons[0]);

    await user.click(screen.getByText('Change Password'));

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: 'Change Password' })
      ).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Change Password' })
      ).not.toBeInTheDocument();
    });
  });

  it('opens modify authorised routes dialog and closes it correctly', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button', { name: 'Row Actions' });
    await user.click(addButtons[0]);

    await user.click(screen.getByText('Modify Authorised Routes'));

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: 'Modify Authorised Routes' })
      ).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Modify Authorised Routes' })
      ).not.toBeInTheDocument();
    });
  });

  it('sets the table filters and clears the table filters', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });
    const clearFiltersButton = screen.getByRole('button', {
      name: 'Clear Filters',
    });

    expect(clearFiltersButton).toBeDisabled();

    const nameInput = screen.getByLabelText('Filter by Username');

    await user.type(nameInput, '9');

    await waitFor(() => {
      expect(screen.queryByText('user1')).not.toBeInTheDocument();
    });

    await user.click(clearFiltersButton);

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });
  }, 10000);
});
