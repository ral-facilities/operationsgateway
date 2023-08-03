import React from 'react';
import { screen, RenderResult, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SaveSessionDialogue, {
  SessionDialogueProps,
} from './saveSessionDialogue.component';
import { renderComponentWithProviders } from '../setupTests';

describe('save session dialogue', () => {
  let props: SessionDialogueProps;
  let user;

  const onClose = jest.fn();
  const onChangeSessionName = jest.fn();
  const onChangeSessionSummary = jest.fn();

  const createView = (): RenderResult => {
    return renderComponentWithProviders(<SaveSessionDialogue {...props} />);
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      sessionName: undefined,
      sessionSummary: '',
      onChangeSessionName: onChangeSessionName,
      onChangeSessionSummary: onChangeSessionSummary,
    };

    user = userEvent; // Assigning userEvent to 'user'
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays warning message when name field is not defined', async () => {
    createView();
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);
    const helperTexts = screen.getByText('Please enter a name');
    expect(helperTexts).toBeInTheDocument();
    expect(onChangeSessionName).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls setSessionName when input value changes', async () => {
    createView();

    const nameInput = screen.getByLabelText('Name *');
    user.type(nameInput, 'Test Session');

    await waitFor(() => {
      expect(onChangeSessionName).toHaveBeenCalledWith('Test Session');
    });
  });

  it('displays error message when post request fails', async () => {
    props = { ...props, sessionName: 'test_dup' };
    createView();
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText('Request failed with status code 409')
      ).toBeInTheDocument();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls setSessionSummary when input value changes', async () => {
    createView();
    const summaryTextarea = screen.getByLabelText('Summary');
    user.type(summaryTextarea, 'Test Summary');
    await waitFor(() => {
      expect(onChangeSessionSummary).toHaveBeenCalled();
    });
  });

  it('calls onClose when Close button is clicked', async () => {
    createView();
    const closeButton = screen.getByRole('button', { name: 'Close' });
    user.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('calls handleExportSession when Save button is clicked with a valid session name', async () => {
    props = {
      open: true,
      onClose: onClose,
      sessionName: 'Test Session',
      sessionSummary: 'Test Summary',
      onChangeSessionName: onChangeSessionName,
      onChangeSessionSummary: onChangeSessionSummary,
    };
    createView();
    const saveButton = screen.getByRole('button', { name: 'Save' });
    user.click(saveButton); // Using user.click instead of fireEvent.click

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
