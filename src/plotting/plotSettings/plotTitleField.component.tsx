import React from 'react';
import { TextField } from '@mui/material';

const PlotTitleField = (props: {
  plotTitle: string;
  changePlotTitle: (title: string) => void;
}) => {
  const { plotTitle, changePlotTitle } = props;

  const handleChangeTitle = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      changePlotTitle(event.target.value);
    },
    [changePlotTitle]
  );

  return (
    <TextField
      label="Title"
      variant="outlined"
      size="small"
      value={plotTitle}
      onChange={handleChangeTitle}
      fullWidth
      InputProps={{ style: { fontSize: 12 } }}
      InputLabelProps={{ style: { fontSize: 12 } }}
    />
  );
};

export default PlotTitleField;
