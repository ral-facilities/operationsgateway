import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useExportData } from '../api/export';
import { renderComponentWithProviders } from '../testUtils';
import ExportDialogue from './exportDialogue.component';

vi.mock('../api/export', () => ({
  useExportData: vi.fn(),
}));

describe('ExportDialogue', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.mocked(useExportData).mockReturnValue({
      mutate: vi.fn(),
    });

    user = userEvent.setup();
  });

  it('renders ExportDialogue component', () => {
    renderComponentWithProviders(
      <ExportDialogue open={true} onClose={() => {}} />
    );
    const exportDataTitle = screen.getByText('Export Data');
    expect(exportDataTitle).toBeInTheDocument();
  });

  it('handles row change', async () => {
    renderComponentWithProviders(
      <ExportDialogue open={true} onClose={() => {}} />
    );
    const allRowsRadio = screen.getByLabelText('All Rows') as HTMLInputElement;
    await user.click(allRowsRadio);
    expect(allRowsRadio.checked).toBe(true);

    const visibleRowsRadio = screen.getByLabelText(
      'Visible Rows'
    ) as HTMLInputElement;
    await user.click(visibleRowsRadio);
    expect(visibleRowsRadio.checked).toBe(true);
    expect(allRowsRadio.checked).toBe(false);
  });

  it('handles content change', async () => {
    renderComponentWithProviders(
      <ExportDialogue open={true} onClose={() => {}} />
    );
    const imagesCheckbox = screen.getByLabelText('Images') as HTMLInputElement;
    expect(imagesCheckbox.checked).toBe(false);

    await user.click(imagesCheckbox);
    expect(imagesCheckbox.checked).toBe(true);
  });

  it('handles closing the dialogue', async () => {
    const onCloseMock = vi.fn();
    renderComponentWithProviders(
      <ExportDialogue open={true} onClose={onCloseMock} />
    );
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('handles export click', async () => {
    const onCloseMock = vi.fn();
    const exportData = vi.fn();
    vi.mocked(useExportData).mockReturnValue({
      mutate: exportData,
      isPending: true,
    });
    renderComponentWithProviders(
      <ExportDialogue open={true} onClose={onCloseMock} />
    );

    const exportButton = screen.getByText('Export');
    await user.click(exportButton);
    expect(exportData).toHaveBeenCalledWith({
      exportType: 'All Rows',
      dataToExport: {
        Scalars: true,
        Images: false,
        'Waveform CSVs': false,
        'Waveform Images': false,
      },
    });

    expect(screen.getByText('Generating export data...')).toBeVisible();
  });
});
