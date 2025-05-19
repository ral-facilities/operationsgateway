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
      slotProps={{
        input: { sx: { fontSize: 12 } },
        inputLabel: { sx: { fontSize: 12 } },
      }}
      {...rest}
    />
  );
};

export default PlotSettingsTextField;
