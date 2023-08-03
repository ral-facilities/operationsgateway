import React from 'react';
import ViewTabs from './viewTabs.component';
import { renderComponentWithProviders } from '../setupTests';
import { screen, within } from '@testing-library/react';
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
});
