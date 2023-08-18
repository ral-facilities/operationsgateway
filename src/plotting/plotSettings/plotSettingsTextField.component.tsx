import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

const PlotSettingsTextField = (
  props: {
    value: string;
    onChange: (title: string) => void;
  } & Omit<TextFieldProps, 'value' | 'onChange'>
) => {
  const { value, onChange, ...rest } = props;

  const handleChangeTitle = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  return (
    <TextField
      fullWidth
      variant="outlined"
      size="small"
      value={value}
      onChange={handleChangeTitle}
      InputProps={{ style: { fontSize: 12 } }}
      InputLabelProps={{ style: { fontSize: 12 } }}
      {...rest}
    />
  );
};

export default PlotSettingsTextField;
