import { Search } from '@mui/icons-material';
import {
  Autocomplete,
  type FilterOptionsState,
  InputAdornment,
  TextField,
} from '@mui/material';
import React from 'react';
import { FullChannelMetadata } from '../app.types';

type ChannelSearchProps = {
  currPathAndChannel: string;
  channels: FullChannelMetadata[];
  onSearchChange: (channel: FullChannelMetadata) => void;
};

const filterOptions = (
  options: FullChannelMetadata[],
  { inputValue }: FilterOptionsState<FullChannelMetadata>
) => {
  const searchString = inputValue.toLowerCase();

  return options.filter((option) => {
    const name = option?.name?.toLowerCase();
    const systemName = option.systemName.toLowerCase();
    // need to search both friendly and system names for a match
    return name?.includes(searchString) || systemName.includes(searchString);
  });
};

const ChannelSearch = (props: ChannelSearchProps) => {
  const { onSearchChange, channels, currPathAndChannel } = props;

  const [value, setValue] = React.useState<FullChannelMetadata | null>(null);
  const [inputValue, setInputValue] = React.useState('');

  React.useEffect(() => {
    // clear the search box if the user clicks another channel / navigates via breadcrumbs
    if (value && currPathAndChannel !== `${value.path}/${value.systemName}`) {
      setValue(null);
      setInputValue('');
    }
  }, [currPathAndChannel, value]);

  return (
    <Autocomplete
      fullWidth
      filterOptions={filterOptions}
      value={value}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      size="small"
      options={channels}
      getOptionLabel={(option) =>
        option.name
          ? `${option.name} (${option.systemName})`
          : option.systemName
      }
      blurOnSelect
      onChange={(event: unknown, newValue: FullChannelMetadata | null) => {
        if (newValue) onSearchChange(newValue);
        setValue(newValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search data channels"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
};

export default ChannelSearch;
