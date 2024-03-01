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
import { useAppSelector } from '../state/hooks';
import { selectSelectedRows } from '../state/slices/selectionSlice';

export interface ExportDialogueProps {
  open: boolean;
  onClose: () => void;
}

const ExportDialogue = (props: ExportDialogueProps) => {
  const { open, onClose } = props;

  const radioLabels = ['All Rows', 'Visible Rows', 'Selected Rows'];
  const [selectedRow, setSelectedRow] = React.useState('All Rows');
  const [selectedContent, setSelectedContent] = React.useState({
    Scalars: true,
    Images: false,
    'Waveform CSVs': false,
    'Waveform Images': false,
  });

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const handleExportClick = () => {
    console.log('Selected Row:', selectedRow);
    console.log('Selected Content:', selectedContent);
    console.log('Selected Columns:', selectedColumns);
  };

  const handleRowChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRow(event.target.value);
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedContent({
      ...selectedContent,
      [event.target.value]: event.target.checked,
    });
  };

  const selectedColumns = useAppSelector(selectSelectedRows);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg">
      <DialogTitle>Export Data</DialogTitle>
      <DialogContent>
        <FormLabel>Choose the rows to be exported:</FormLabel>
        <RadioGroup
          value={selectedRow}
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
          {Object.keys(selectedContent).map((label) => (
            <FormControlLabel
              key={label}
              control={
                <Checkbox
                  checked={
                    selectedContent[label as keyof typeof selectedContent]
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
