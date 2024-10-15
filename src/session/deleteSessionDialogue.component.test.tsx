import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { ImportSessionType } from '../state/store';
import { renderComponentWithProviders } from '../testUtils';
import DeleteSessionDialogue, {
  DeleteSessionDialogueProps,
} from './deleteSessionDialogue.component';

describe('delete session dialogue', () => {
  let props: DeleteSessionDialogueProps;
  let user: UserEvent;
  const onClose = vi.fn();
  const onDeleteLoadedSession = vi.fn();

  const createView = (): RenderResult => {
    return renderComponentWithProviders(<DeleteSessionDialogue {...props} />);
  };
  const sessionData = {
    _id: '1',
    name: 'test',
    summary: 'test',
    timestamp: '',
    auto_saved: false,
    session: {} as ImportSessionType,
  };
  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      sessionData: sessionData,
      onDeleteLoadedSession: onDeleteLoadedSession,
      loadedSessionId: undefined,
    };
    user = userEvent.setup();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });
  it('renders correctly', async () => {
    createView();
    expect(screen.getByText('Delete Session')).toBeInTheDocument();
    expect(screen.getByTestId('delete-session-name')).toHaveTextContent('test');
  });

  it('calls onClose when Close button is clicked', async () => {
    createView();
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays warning message when session data is not loaded', async () => {
    props = {
      ...props,
      sessionData: undefined,
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

  it('calls handleDeleteSession when continue button is clicked with a valid session name', async () => {
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('calls handleDeleteSession when continue button is clicked with a valid session name and clears loaded session id', async () => {
    props = { ...props, loadedSessionId: '1' };
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
    expect(onDeleteLoadedSession).toHaveBeenCalled();
  });
});
