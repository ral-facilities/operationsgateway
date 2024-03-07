import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderComponentWithProviders } from '../setupTests';
import ExportButton from './exportButton.component';
import React from 'react';

describe('ExportButton', () => {
  it('opens and closes the dialog on button clicks', async () => {
    renderComponentWithProviders(<ExportButton />);

    fireEvent.click(screen.getByText('Export'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens export dialogue on button click', () => {
    renderComponentWithProviders(<ExportButton />);
    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);
    const exportDialogue = screen.getByRole('dialog');
    expect(exportDialogue).toBeInTheDocument();
  });
});
