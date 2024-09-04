import {
  Autocomplete,
  Chip,
  Grid,
  SxProps,
  TextField,
  Theme,
  autocompleteClasses,
  createFilterOptions,
} from '@mui/material';
import React from 'react';
import { FunctionToken, ValidateFunctionState } from '../app.types';
import {
  useClickHandler,
  useKeydownHandler,
  useOnChange,
} from '../filtering/filterInput.component';
import { errorState } from './functionsDialog.component';

export interface FunctionsInputsProps {
  channels: FunctionToken[];
  operators: FunctionToken[];
  functions: FunctionToken[];
  value: ValidateFunctionState;
  setValue: (update: Partial<ValidateFunctionState>) => void;
  error?: errorState;
  setError: (error?: Partial<errorState>) => void;
  checkErrors: () => void;
}

// use matchFrom start here as otherwise it's hard to input e.g. the number 1 as there
// are channels with that in their name. It also matches eCat behaviour - but we should
// check if this is desired.
const filterOptions = createFilterOptions<FunctionToken>({
  matchFrom: 'start',
  limit: 100,
});

const FunctionsInputs = (props: FunctionsInputsProps) => {
  const {
    channels,
    operators,
    value,
    setValue,
    error,
    setError,
    checkErrors,
    functions,
  } = props;

  const options = React.useMemo(() => {
    return [...operators, ...functions, ...channels];
  }, [channels, operators, functions]);

  const [inputValue, setInputValue] = React.useState<string>('');
  // on load, set input position to the end
  const [inputIndex, setInputIndex] = React.useState<number>(
    value.expression.length
  );

  const setErrorWrapper = (error: string | undefined) => {
    if (error) {
      setError({ expression: { message: error } });
    } else {
      setError(undefined);
    }
  };

  const keydownHandler = useKeydownHandler<FunctionToken>({
    inputValue,
    inputIndex,
    setInputIndex,
    value: value.expression,
    setValue: (newExpression) => setValue({ expression: newExpression }),
    setError: setErrorWrapper,
    options: [...functions, ...channels],
    operators,
    setInputValue,
    enableCustomStringHandling: false,
  });

  const clickHandler = useClickHandler({ setInputIndex, inputIndex });

  const onChange = useOnChange<FunctionToken>({
    inputValue,
    setInputValue,
    setValue: (newExpression) => setValue({ expression: newExpression }),
    setInputIndex,
    setError: setErrorWrapper,
    value: value.expression,
    inputIndex,
    enableCustomStringHandling: false,
  });

  let tags: React.ReactElement[] = [];

  return (
    <Grid container spacing={1}>
      <Grid item sx={{ width: 250 }}>
        <TextField
          fullWidth
          label="Name"
          value={value.name}
          onChange={(e) => {
            setError(undefined);
            setValue({ name: e.target.value });
          }}
          error={!!error?.name}
          helperText={error?.name?.message}
          size="small"
        />
      </Grid>
      <Grid item xs>
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
          onInputChange={(_event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          value={value.expression}
          onChange={onChange}
          // this is need to allow user to repeatedly select the same tag
          isOptionEqualToValue={(_option, _value) => false}
          renderTags={(value, getTagProps) => {
            tags = value.map((option: FunctionToken, index: number) => (
              <Chip
                label={option.label}
                size="small"
                {...getTagProps({ index })}
                key={getTagProps({ index }).key}
                onDelete={(event) => {
                  setError(undefined);
                  getTagProps({ index }).onDelete(event);
                }}
              />
            ));
            return null;
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Expression"
              error={!!error?.expression}
              helperText={error?.expression?.message}
              onKeyDown={keydownHandler}
              onClick={clickHandler}
              InputProps={{
                ...params.InputProps,
                // we need this data-id so we can tell when a user is clicking between
                // tags in clickHander - this is a valid data-* prop so ignore TS
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                'data-id': 'Input',
                startAdornment: tags.slice(0, inputIndex),
                endAdornment: tags.slice(inputIndex),
              }}
            />
          )}
          renderOption={(props, option) => (
            // ensure we use the value and not the label as the key
            // as theoretically only value has to be unique
            <li {...props} key={option.value}>
              {option.label}
            </li>
          )}
          // for some reason, it's not accepting the sx prop here even though it should
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ListboxProps={
            {
              sx: (theme: Theme) => ({
                [`& .${autocompleteClasses.option}`]: {
                  [`&.Mui-focused,&.Mui-focusVisible`]: {
                    backgroundColor: theme.palette.action.focus,
                  },
                },
              }),
            } as {
              sx: SxProps<Theme>;
            }
          }
        />
      </Grid>
    </Grid>
  );
};

export default FunctionsInputs;
