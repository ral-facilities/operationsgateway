import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import type { AxiosError } from 'axios';
import React from 'react';
import { useExportData } from '../api/export';
import type { FullChannelMetadata } from '../app.types';
import handleOG_APIError from '../handleOG_APIError';

export interface ExportChannelColumnProps {
  open: boolean;
  onClose: () => void;
  channelInfo: FullChannelMetadata;
}

const ExportChannelColumn = (props: ExportChannelColumnProps) => {
  const { open, onClose, channelInfo } = props;

  const { mutateAsync: exportChannels, isPending } = useExportData();

  const handleExportChannel = React.useCallback(() => {
    exportChannels({
      exportType: 'All Rows',
      dataToExport: {
        Scalars: true,
        Images: true,
        'Waveform CSVs': true,
        'Waveform Images': true,
      },
      selectedColumn: channelInfo.systemName,
    }).catch((error: AxiosError) => {
      handleOG_APIError(error);
    });
  }, [channelInfo.systemName, exportChannels]);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg">
        <DialogTitle>Export Channel</DialogTitle>
        <DialogContent>
          Do you want to export all files in the{' '}
          <strong data-testid="export-channel-name">
            {channelInfo.name || channelInfo.systemName}
          </strong>
          ?
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button onClick={handleExportChannel}>Export</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isPending ?? false}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
        <DialogTitle>Generating export data...</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress
            sx={(theme) => ({
              color: theme.palette.text.primary,
            })}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportChannelColumn;
