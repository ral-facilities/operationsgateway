import React from 'react';
import ViewTabs from './viewTabs.component';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '../setupTests';
import userEvent from '@testing-library/user-event';

describe('View Tabs', () => {
  const createView = () => {
    return renderWithProviders(<ViewTabs />);
  };

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
});
