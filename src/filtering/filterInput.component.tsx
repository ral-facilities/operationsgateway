import { Autocomplete, TextField, createFilterOptions } from '@mui/material';
import React from 'react';
import { Token, ParserError, operators, parseFilter } from './filterParser';

interface FilterInputProps {
  channels: Token[];
  value: Token[];
  setValue: (value: Token[]) => void;
  error: string;
  setError: (error: string) => void;
}

// use matchFrom start here as otherwise it's hard to input e.g. the number 1 as there
// are channels with that in their name. It also matches eCat behaviour - but we should
// check if this is desired.
const filterOptions = createFilterOptions<Token>({
  matchFrom: 'start',
  limit: 100,
});

const FilterInput = (props: FilterInputProps) => {
  const { channels, value, setValue, error, setError } = props;
  const options = React.useMemo(() => {
    return [...operators, ...channels];
  }, [channels]);
  const [inputValue, setInputValue] = React.useState<string>('');

  const checkErrors = React.useCallback(() => {
    try {
      parseFilter(value);
      setError('');
    } catch (e) {
      if (e instanceof ParserError) setError(e.message);
    }
  }, [value, setError]);

  return (
    <Autocomplete
      autoHighlight
      filterOptions={filterOptions}
      multiple
      options={options}
      freeSolo
      size="small"
      fullWidth
      inputValue={inputValue}
      onBlur={checkErrors}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      value={value}
      onChange={(
        event: unknown,
        newValue: (string | Token)[],
        reason: string
      ) => {
        // createOption implies a value which is not in options so either
        // a number, a string (surrounded by quotes) or we should reject
        if (reason === 'createOption') {
          // newTerm is a string not a Token so use that fact to find it (and it means we can safely cast here)
          const newTerm = newValue.find((v) => typeof v === 'string') as string;
          const newTermIndex = newValue.indexOf(newTerm);
          // new term is a valid number so allow it to be added
          if (!Number.isNaN(Number(newTerm))) {
            newValue[newTermIndex] = {
              type: 'number',
              value: newTerm,
              label: newTerm,
            };
            setValue(newValue as Token[]);
            setError('');
          } // new term is a string specified by either single or double quotes so allow it
          else if (
            (newTerm[0] === '"' && newTerm[newTerm.length - 1] === '"') ||
            (newTerm[0] === "'" && newTerm[newTerm.length - 1] === "'")
          ) {
            newValue[newTermIndex] = {
              type: 'string',
              value: newTerm,
              label: newTerm,
            };
            setValue(newValue as Token[]);
            setError('');
          } else {
            // otherwise don't add the new term & leave it in textbox
            setInputValue(newTerm);
          }
        } else {
          setValue(newValue as Token[]);
          setError('');
        }
      }}
      // this is need to allow user to repeatedly select the same tag
      isOptionEqualToValue={(option, value) => false}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Filter"
          error={error.length > 0}
          helperText={error}
        />
      )}
    />
  );
};

export default FilterInput;
