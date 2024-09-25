import { TextField, TextFieldProps } from '@mui/material';
import React from 'react';

export type PlotSettingsTextFieldProps = {
  value: string;
  onChange: (title: string) => void;
} & Omit<TextFieldProps, 'value' | 'onChange'>;

const PlotSettingsTextField = (props: PlotSettingsTextFieldProps) => {
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
