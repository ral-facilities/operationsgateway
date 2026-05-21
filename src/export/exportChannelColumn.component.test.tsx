import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useExportData } from '../api/export';
import { renderComponentWithProviders } from '../testUtils';
import type { ExportChannelColumnProps } from './exportChannelColumn.component';
import ExportChannelColumn from './exportChannelColumn.component';

vi.mock('../api/export', () => ({
  useExportData: vi.fn(),
}));

describe('ExportChannelColumn', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let props: ExportChannelColumnProps;
  const onClose = vi.fn();
  const exportData = vi.fn().mockResolvedValue({});

  const createView = () => {
    renderComponentWithProviders(<ExportChannelColumn {...props} />);
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose,
      channelInfo: {
        systemName: 'TEST-IMAGE',
        name: 'Test Image',
        path: '/image/test',
        type: 'image',
      },
    };
    vi.mocked(useExportData, { partial: true }).mockReturnValue({
      mutateAsync: exportData,
    });

    user = userEvent.setup();
  });

  it('renders ExportDialogue component', () => {
    createView();
    const exportDataTitle = screen.getByText('Export Channel');
    expect(exportDataTitle).toBeInTheDocument();
  });

  it('handles closing the dialogue', async () => {
    createView();
    const cancelButton = screen.getByText('Close');
    await user.click(cancelButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('should should pending message', async () => {
    vi.mocked(useExportData, { partial: true }).mockReturnValue({
      mutateAsync: exportData,
      isPending: true,
    });
    createView();

    const exportButton = screen.getByText('Export');
    await user.click(exportButton);
    expect(exportData).toHaveBeenCalledWith({
      exportType: 'All Rows',
      dataToExport: {
        Scalars: false,
        Strings: false,
        Images: true,
        'Float Images': false,
        'Waveform CSVs': false,
        'Waveform Images': false,
        'Vector CSVs': false,
        'Vector Images': false,
      },
      selectedColumn: 'TEST-IMAGE',
    });

    expect(screen.getByText('Generating export data...')).toBeVisible();
  });

  it('handles export click for float image type', async () => {
    props.channelInfo.type = 'float_image';
    createView();

    const exportButton = screen.getByText('Export');
    await user.click(exportButton);
    expect(exportData).toHaveBeenCalledWith({
      exportType: 'All Rows',
      dataToExport: {
        Scalars: false,
        Strings: false,
        Images: false,
        'Float Images': true,
        'Waveform CSVs': false,
        'Waveform Images': false,
        'Vector CSVs': false,
        'Vector Images': false,
      },
      selectedColumn: 'TEST-IMAGE',
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('handles export click for waveform type', async () => {
    props.channelInfo.type = 'waveform';
    createView();

    const exportButton = screen.getByText('Export');
    await user.click(exportButton);
    expect(exportData).toHaveBeenCalledWith({
      exportType: 'All Rows',
      dataToExport: {
        Scalars: false,
        Strings: false,
        Images: false,
        'Float Images': false,
        'Waveform CSVs': true,
        'Waveform Images': false,
        'Vector CSVs': false,
        'Vector Images': false,
      },
      selectedColumn: 'TEST-IMAGE',
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('handles export click for vector type', async () => {
    props.channelInfo.type = 'vector';
    createView();

    const exportButton = screen.getByText('Export');
    await user.click(exportButton);
    expect(exportData).toHaveBeenCalledWith({
      exportType: 'All Rows',
      dataToExport: {
        Scalars: false,
        Strings: false,
        Images: false,
        'Float Images': false,
        'Waveform CSVs': false,
        'Waveform Images': false,
        'Vector CSVs': true,
        'Vector Images': false,
      },
      selectedColumn: 'TEST-IMAGE',
    });

    expect(onClose).toHaveBeenCalled();
  });
});
