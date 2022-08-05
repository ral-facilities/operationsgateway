import React from 'react';
import ViewTabs from './viewTabs.component';
import { screen } from '@testing-library/react';
import { renderComponentWithProviders } from '../setupTests';
import userEvent from '@testing-library/user-event';

describe('View Tabs', () => {
  const createView = () => {
    return renderComponentWithProviders(<ViewTabs />);
  };

  it('lets users switch between tabs', async () => {
    const user = userEvent.setup();
    createView();

    // should load Data tab initially
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      'Data'
    );
    expect(screen.getByRole('tabpanel', { name: 'Data' })).toBeVisible();
    expect(
      screen.queryByRole('tabpanel', { name: 'Plots' })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Plots' }));

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      'Plots'
    );
    expect(screen.getByRole('tabpanel', { name: 'Plots' })).toBeVisible();
    expect(
      screen.queryByRole('tabpanel', { name: 'Data' })
    ).not.toBeInTheDocument();
  });
});
