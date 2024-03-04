import { screen, fireEvent } from '@testing-library/react';
import { renderComponentWithProviders } from '../setupTests';
import ExportButton from './exportButton.component';
import React from 'react';

it('renders ExportButton component', () => {
  renderComponentWithProviders(<ExportButton />);
  const exportButton = screen.getByText('Export');
  expect(exportButton).toBeInTheDocument();
});

it('opens export dialogue on button click', () => {
  renderComponentWithProviders(<ExportButton />);
  const exportButton = screen.getByText('Export');
  fireEvent.click(exportButton);
  const exportDialogue = screen.getByRole('dialog');
  expect(exportDialogue).toBeInTheDocument();
});
