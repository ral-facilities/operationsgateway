import { screen, fireEvent } from '@testing-library/react';
import { renderComponentWithProviders } from '../setupTests';
import ExportDialogue from './exportDialogue.component';
import React from 'react';
import { useExportData } from '../api/export';

jest.mock('../api/export', () => ({
  useExportData: jest.fn(),
}));

describe('ExportDialogue', () => {
  beforeEach(() => {
    (useExportData as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
    });
  });

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

    const visibleRowsRadio = screen.getByLabelText(
      'Visible Rows'
    ) as HTMLInputElement;
    fireEvent.click(visibleRowsRadio);
    expect(visibleRowsRadio.checked).toBe(true);
    expect(allRowsRadio.checked).toBe(false);
  });

  it('handles content change', () => {
    renderComponentWithProviders(
      <ExportDialogue open={true} onClose={() => {}} />
    );
    const imagesCheckbox = screen.getByLabelText('Images') as HTMLInputElement;
    expect(imagesCheckbox.checked).toBe(false);

    fireEvent.click(imagesCheckbox);
    expect(imagesCheckbox.checked).toBe(true);
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

  it('handles export click', () => {
    const onCloseMock = jest.fn();
    const exportData = jest.fn();
    (useExportData as jest.Mock).mockReturnValue({
      mutate: exportData,
    });
    renderComponentWithProviders(
      <ExportDialogue open={true} onClose={onCloseMock} />
    );

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);
    expect(exportData).toHaveBeenCalledWith({
      exportType: 'All Rows',
      dataToExport: {
        Scalars: true,
        Images: false,
        'Waveform CSVs': false,
        'Waveform Images': false,
      },
    });
  });
});
