import {
  Button,
  Radio,
  RadioGroup,
  FormGroup,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import React from 'react';
import { useExportData } from '../api/export';

export interface ExportDialogueProps {
  open: boolean;
  onClose: () => void;
}

const ExportDialogue = (props: ExportDialogueProps) => {
  const { open, onClose } = props;

  const mutate = useExportData().mutate;
  const radioLabels = ['All Rows', 'Visible Rows', 'Selected Rows'];
  const [selectedExportType, setSelectedExportType] =
    React.useState('All Rows');
  const [selectedExportContent, setSelectedExportContent] = React.useState({
    Scalars: true,
    Images: false,
    'Waveform CSVs': false,
    'Waveform Images': false,
  });

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const handleExportClick = () =>
    mutate({
      exportType: selectedExportType,
      dataToExport: selectedExportContent,
    });

  const handleRowChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedExportType(event.target.value);
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedExportContent({
      ...selectedExportContent,
      [event.target.value]: event.target.checked,
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg">
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleExportClick}>Export</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialogue;
