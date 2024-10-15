import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { ImportSessionType } from '../state/store';
import { renderComponentWithProviders } from '../testUtils';
import SessionDialogue, {
  SessionDialogueProps,
} from './sessionDialogue.component';

describe('session dialogue', () => {
  let props: SessionDialogueProps;
  let user: UserEvent;
  const onClose = vi.fn();
  const onChangeSessionName = vi.fn();
  const onChangeSessionSummary = vi.fn();
  const onChangeLoadedSessionId = vi.fn();
  const onChangeAutoSaveSessionId = vi.fn();

  const createView = (): RenderResult => {
    return renderComponentWithProviders(<SessionDialogue {...props} />);
  };

  describe('create session dialogue', () => {
    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        sessionName: undefined,
        sessionSummary: '',
        onChangeSessionName: onChangeSessionName,
        onChangeSessionSummary: onChangeSessionSummary,
        requestType: 'create',
        onChangeLoadedSessionId: onChangeLoadedSessionId,
        onChangeAutoSaveSessionId: onChangeAutoSaveSessionId,
      };

      user = userEvent.setup();
    });

    afterEach(() => {
      vi.clearAllMocks();
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
      await user.type(nameInput, 'T');

      await waitFor(() => {
        expect(onChangeSessionName).toHaveBeenCalledWith('T');
      });
    });

    it('calls setSessionSummary when input value changes', async () => {
      createView();
      const summaryTextarea = screen.getByLabelText('Summary');
      await user.type(summaryTextarea, 'Test Summary');
      await waitFor(() => {
        expect(onChangeSessionSummary).toHaveBeenCalled();
      });
    });

    it('calls onClose when Close button is clicked', async () => {
      createView();
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('calls handleExportSession when Save button is clicked with a valid session name', async () => {
      props = {
        ...props,
        sessionName: 'Test Session',
        sessionSummary: 'Test Summary',
      };

      createView();
      expect(screen.getByText('Save Session')).toBeInTheDocument();
      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
      expect(onChangeLoadedSessionId).toHaveBeenCalledWith('1');
      expect(onChangeAutoSaveSessionId).toHaveBeenCalledWith(undefined);
    });
  });

  describe('edit  session dialogue', () => {
    const sessionData = {
      _id: '1',
      name: 'edit name',
      summary: 'edit summary',
      timestamp: '',
      auto_saved: false,
      session: {} as ImportSessionType,
    };
    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        sessionName: 'edit name',
        sessionSummary: 'edit summary',
        onChangeSessionName: onChangeSessionName,
        onChangeSessionSummary: onChangeSessionSummary,
        requestType: 'edit',
        onChangeLoadedSessionId: onChangeLoadedSessionId,
        sessionData: sessionData,
        onChangeAutoSaveSessionId: onChangeAutoSaveSessionId,
      };

      user = userEvent.setup();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('prefills the name and summary with the current session', async () => {
      createView();
      expect(screen.getByText('Edit Session')).toBeInTheDocument();
      expect(screen.getByDisplayValue('edit name')).toBeInTheDocument();
      expect(screen.getByDisplayValue('edit summary')).toBeInTheDocument();
    });

    it('displays warning message when name field is not defined', async () => {
      props = { ...props, sessionName: undefined };
      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);
      const helperTexts = screen.getByText('Please enter a name');
      expect(helperTexts).toBeInTheDocument();
      expect(onChangeSessionName).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('calls handleExportSession when Save button is clicked with a valid session name', async () => {
      createView();
      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });
});
