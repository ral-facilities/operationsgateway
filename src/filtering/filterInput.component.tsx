import { Autocomplete, TextField } from '@mui/material';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface FilterInputProps {
  channels: string[];
}

const operators = ['=', '!=', 'and', 'or', 'not'];

const FilterInput = (props: FilterInputProps) => {
  const { channels } = props;
  const options = React.useMemo(() => [...channels, ...operators], [channels]);
  const [value, setValue] = React.useState<string[]>([]);
  return (
    <Autocomplete
      multiple
      id="tags-outlined"
      options={options}
      freeSolo
      autoHighlight
      size="small"
      fullWidth
      value={value}
      onChange={(event: unknown, newValue: string[]) => {
        setValue(newValue);
      }}
      // this is need to allow user to repeatedly select the same tag
      isOptionEqualToValue={(option, value) => false}
      renderInput={(params) => <TextField {...params} label="Filter" />}
    />
  );
};

export default FilterInput;
