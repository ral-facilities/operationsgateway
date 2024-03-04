import { screen, fireEvent } from '@testing-library/react';
import { renderComponentWithProviders } from '../setupTests';
import ExportDialogue from './exportDialogue.component';
import React from 'react';

describe('ExportDialogue', () => {
  it('renders ExportDialogue component', () => {
    renderComponentWithProviders(
      <ExportDialogue open={true} onClose={() => {}} />
    );
    const exportDataTitle = screen.getByText('Export Data');
    expect(exportDataTitle).toBeInTheDocument();
  });

  it('handles row change', () => {
    renderComponentWithProviders(
      <ExportDialogue open={true} onClose={() => {}} />
    );
    const allRowsRadio = screen.getByLabelText('All Rows') as HTMLInputElement;
    fireEvent.click(allRowsRadio);
    expect(allRowsRadio.checked).toBe(true);
  });

  it('handles content change', () => {
    renderComponentWithProviders(
      <ExportDialogue open={true} onClose={() => {}} />
    );
    const imagesCheckbox = screen.getByLabelText('Images') as HTMLInputElement;
    expect(imagesCheckbox.checked).toBe(false);
  });

  it('handles closing the dialogue', () => {
    const onCloseMock = jest.fn();
    renderComponentWithProviders(
      <ExportDialogue open={true} onClose={onCloseMock} />
    );
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(onCloseMock).toHaveBeenCalled();
  });
});
