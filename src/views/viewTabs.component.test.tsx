import React from 'react';
import ViewTabs from './viewTabs.component';
import { renderComponentWithProviders } from '../setupTests';
import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('View Tabs', () => {
  let user;
  const createView = () => {
    return renderComponentWithProviders(<ViewTabs />);
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders correctly', () => {
    const { asFragment } = createView();
    expect(asFragment()).toMatchSnapshot();
  });

  it('lets users switch between tabs', async () => {
    const user = userEvent.setup();
    createView();

    const viewTabs = within(screen.getByRole('tablist', { name: 'view tabs' }));

    // should load Data tab initially
    expect(viewTabs.getByRole('tab', { selected: true })).toHaveTextContent(
      'Data'
    );
    expect(screen.getByRole('tabpanel', { name: 'Data' })).toBeVisible();
    expect(
      screen.queryByRole('tabpanel', { name: 'Plots' })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Plots' }));

    expect(viewTabs.getByRole('tab', { selected: true })).toHaveTextContent(
      'Plots'
    );
    expect(screen.getByRole('tabpanel', { name: 'Plots' })).toBeVisible();
    expect(
      screen.queryByRole('tabpanel', { name: 'Data' })
    ).not.toBeInTheDocument();
  });

  it('opens the save session dialogue', async () => {
    createView();

    const saveSessionButton = screen.getByTestId('AddCircleIcon');

    await user.click(saveSessionButton);

    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('closes the save session dialogue', async () => {
    createView();

    const saveSessionButton = screen.getByTestId('AddCircleIcon');

    await user.click(saveSessionButton);

    expect(screen.getByRole('dialog')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.getByRole('dialog')).not.toBeVisible();
  });

  it('sets session name and summary', async () => {
    createView();

    const saveSessionButton = screen.getByTestId('AddCircleIcon');

    await user.click(saveSessionButton);

    expect(screen.getByRole('dialog')).toBeVisible();

    const sessionNameInput = screen.getByLabelText('Name *');
    const sessionSummaryInput = screen.getByLabelText('Summary');

    await user.type(sessionNameInput, 'Test Session');
    await user.type(sessionSummaryInput, 'Test Summary');

    expect(sessionNameInput).toHaveValue('Test Session');
    expect(sessionSummaryInput).toHaveValue('Test Summary');
  });

  it('opens the delete session dialogue', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Session 1')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', {
      name: 'delete Session 1 session',
    });

    await user.click(deleteButton);

    const deleteDialog = screen.getByRole('dialog');

    expect(deleteDialog).toBeVisible();
    expect(
      within(deleteDialog).getByTestId('delete-session-name')
    ).toHaveTextContent('Session 1');

    const closeButton = screen.getByRole('button', { name: 'Close' });
    user.click(closeButton);
    await waitFor(() => {
      expect(deleteDialog).not.toBeInTheDocument();
    });
  });

  it('deletes currently loaded user session', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Session 1')).toBeInTheDocument();
    });

    const session1 = screen.getByText('Session 1');
    await user.click(session1);

    const deleteButton = screen.getByRole('button', {
      name: 'delete Session 1 session',
    });

    await user.click(deleteButton);

    const deleteDialog = screen.getByRole('dialog');

    expect(deleteDialog).toBeVisible();
    expect(
      within(deleteDialog).getByTestId('delete-session-name')
    ).toHaveTextContent('Session 1');

    const contniueButton = screen.getByRole('button', { name: 'Continue' });
    user.click(contniueButton);
    await waitFor(() => {
      expect(deleteDialog).not.toBeInTheDocument();
    });
  });

  it('opens the edit session dialogue', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Session 1')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', {
      name: 'edit Session 1 session',
    });

    await user.click(editButton);

    const editDialog = screen.getByRole('dialog');

    expect(editDialog).toBeVisible();
    expect(
      within(editDialog).getByDisplayValue('Session 1')
    ).toBeInTheDocument();
    expect(
      within(editDialog).getByDisplayValue('This is the summary for Session 1')
    ).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    user.click(closeButton);
    await waitFor(() => {
      expect(editDialog).not.toBeInTheDocument();
    });
  });

  it('selects a user session and opens the save as session dialog', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Session 1')).toBeInTheDocument();
    });
    const session1 = screen.getByRole('button', { name: 'Session 1' });
    await user.click(session1);
    const element = screen.getByTestId('session-save-buttons-timestamp');

    expect(element).toHaveTextContent(
      'Session last autosaved: 29 Jun 2023 10:30'
    );

    const saveAsButton = screen.getByRole('button', { name: 'Save as' });
    await user.click(saveAsButton);

    const dialog = screen.getByRole('dialog');

    const summaryTextarea = within(dialog).getByLabelText('Summary');
    const nameInput = within(dialog).getByLabelText('Name *');

    expect(summaryTextarea).toHaveTextContent(
      'This is the summary for Session 1'
    );
    expect(nameInput.value).toBe('Session 1_copy');
  });
});
