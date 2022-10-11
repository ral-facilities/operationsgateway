import React from 'react';
import { TextField } from '@mui/material';

const PlotTitleField = (props: {
  changePlotTitle: (title: string) => void;
}) => {
  const { changePlotTitle } = props;

  const [title, setTitle] = React.useState('');
  const deferredTitle = React.useDeferredValue(title);

  const handleChangeTitle = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
    },
    [setTitle]
  );

  React.useEffect(() => {
    changePlotTitle(deferredTitle);
  }, [changePlotTitle, deferredTitle]);

  return (
    <TextField
      label="Title"
      variant="outlined"
      size="small"
      value={title}
      onChange={handleChangeTitle}
      fullWidth
      InputProps={{ style: { fontSize: 12 } }}
      InputLabelProps={{ style: { fontSize: 12 } }}
    />
  );
};

export default PlotTitleField;
