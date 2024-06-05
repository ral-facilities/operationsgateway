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
  Backdrop,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import React from 'react';
import { useExportData } from '../api/export';

export interface ExportDialogueProps {
  open: boolean;
  onClose: () => void;
}

const ExportDialogue = (props: ExportDialogueProps) => {
  const { open, onClose } = props;

  const { mutate, isPending } = useExportData();
  const radioLabels = ['All Rows', 'Visible Rows', 'Selected Rows'];
  const [selectedExportType, setSelectedExportType] =
    React.useState('All Rows');
  const [selectedExportContent, setSelectedExportContent] = React.useState({
    Scalars: true,
    Images: false,
    'Waveform CSVs': false,
    'Waveform Images': false,
  });

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
      <Backdrop
        open={isPending}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={(theme) => ({
            flexDirection: 'column',
            backgroundColor: theme.palette.background.default,
            borderRadius: '5px',
            padding: theme.spacing(2),
            boxShadow: theme.shadows[5],
          })}
        >
          <Typography
            variant="h6"
            sx={(theme) => ({
              color: theme.palette.text.primary,
              mb: theme.spacing(2),
            })}
          >
            Generating export data...
          </Typography>
          <CircularProgress
            sx={(theme) => ({
              color: theme.palette.text.primary,
            })}
          />
        </Box>
      </Backdrop>
    </>
  );
};

export default ExportDialogue;
