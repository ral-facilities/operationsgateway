import {
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import type { AxiosError } from 'axios';
import React from 'react';
import { useExportData, type DataToExport } from '../api/export';
import handleOG_APIError from '../handleOG_APIError';

export interface ExportDialogueProps {
  open: boolean;
  onClose: () => void;
}

const ExportDialogue = (props: ExportDialogueProps) => {
  const { open, onClose } = props;

  const { mutateAsync: exportChannels, isPending } = useExportData();
  const radioLabels = ['All Rows', 'Visible Rows', 'Selected Rows'];
  const [selectedExportType, setSelectedExportType] =
    React.useState('All Rows');
  const [selectedExportContent, setSelectedExportContent] =
    React.useState<DataToExport>({
      Scalars: true,
      Images: false,
      'Float Image': false,
      'Waveform CSVs': false,
      'Waveform Images': false,
      'Vector CSVs': false,
      'Vector Images': false,
    });

  const handleExportClick = React.useCallback(
    () =>
      exportChannels({
        exportType: selectedExportType,
        dataToExport: selectedExportContent,
      }).catch((error: AxiosError) => {
        handleOG_APIError(error);
      }),
    [exportChannels, selectedExportContent, selectedExportType]
  );

  const handleRowChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedExportType(event.target.value);
  };

  const handleContentChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedExportContent({
        ...selectedExportContent,
        [event.target.value]: event.target.checked,
      });
    },
    [selectedExportContent]
  );

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg">
        <DialogTitle>Export Data</DialogTitle>
        <DialogContent>
          <FormLabel>Choose the rows to be exported:</FormLabel>
          <RadioGroup
            value={selectedExportType}
            onChange={handleRowChange}
            name="radio-buttons-group"
            sx={{ mb: 3 }}
          >
            {radioLabels.map((label) => (
              <FormControlLabel
                key={label}
                value={label}
                control={<Radio />}
                label={label}
                sx={{ mb: -2 }}
              />
            ))}
          </RadioGroup>
          <Divider />
          <FormGroup sx={{ mt: 1 }} onChange={handleContentChange}>
            <FormLabel>Content:</FormLabel>
            {Object.keys(selectedExportContent).map((label) => (
              <FormControlLabel
                key={label}
                control={
                  <Checkbox
                    checked={
                      selectedExportContent[
                        label as keyof typeof selectedExportContent
                      ]
                    }
                    value={label}
                    color="primary"
                  />
                }
                label={label}
                sx={{ mb: -2 }}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleExportClick}>Export</Button>
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

export default ExportDialogue;
