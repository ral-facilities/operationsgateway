import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import UsersJson from '../../mocks/users.json';
import { renderComponentWithProviders } from '../../testUtils';
import DeleteUserDialogue, {
  DeleteUserDialogueProps,
} from './deleteUserDialogue.component';

describe('delete user dialogue', () => {
  let props: DeleteUserDialogueProps;
  let user: UserEvent;
  const onClose = vi.fn();

  const createView = (): RenderResult => {
    return renderComponentWithProviders(<DeleteUserDialogue {...props} />);
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      selectedUser: UsersJson[0],
    };
    user = userEvent.setup();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });
  it('renders correctly', async () => {
    createView();
    expect(screen.getByText('Delete User')).toBeInTheDocument();
    expect(screen.getByTestId('delete-user-name')).toHaveTextContent('user1');
  });

  it('calls onClose when Close button is clicked', async () => {
    createView();
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays warning message when user data is not loaded', async () => {
    props = {
      ...props,
      selectedUser: undefined,
    };
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);
    const helperTexts = screen.getByText(
      'No data provided, Please refresh and try again'
    );
    expect(helperTexts).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('displays warning message when user data does not exist in database', async () => {
    props = {
      ...props,
      selectedUser: { ...UsersJson[0], _id: 'test' },
    };
    createView();

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);
    const helperTexts = await screen.findByText(
      `username field must exist in the database. You put: 'test'`
    );
    expect(helperTexts).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls handleDeleteUser when continue button is clicked with a valid user name', async () => {
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
