import React from 'react';
import { screen, RenderResult, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteSessionDialogue, {
  DeleteSessionDialogueProps,
} from './deleteSessionDialogue.component';
import { renderComponentWithProviders } from '../setupTests';

describe('delete session dialogue', () => {
  let props: DeleteSessionDialogueProps;
  let user;
  const onClose = jest.fn();
  const refetchSessionsList = jest.fn();

  const createView = (): RenderResult => {
    return renderComponentWithProviders(<DeleteSessionDialogue {...props} />);
  };
  const sessionData = {
    name: 'test',
    summary: 'test',
    session_data: '{}',
    auto_saved: false,
    _id: '1',
  };
  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      refetchSessionsList: refetchSessionsList,
      sessionData: sessionData,
    };
    user = userEvent; // Assigning userEvent to 'user'
  });
  afterEach(() => {
    jest.clearAllMocks();
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
    user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
    expect(refetchSessionsList).toHaveBeenCalled();
  });
});
