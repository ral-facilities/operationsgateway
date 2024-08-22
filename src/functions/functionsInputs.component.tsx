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
import { FLASH_ANIMATION } from '../animation';
import { FunctionToken, ValidateFunctionState } from '../app.types';
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
  flashingFunctionValue?: string;
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
    flashingFunctionValue,
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

  const keydownHandler = React.useCallback<(e: React.KeyboardEvent) => void>(
    (e) => {
      const cursorPos = (e.target as HTMLInputElement).selectionStart;
      // only move left when cursor is at start
      if (cursorPos === 0 && e.key === 'ArrowLeft') {
        e.stopPropagation();
        setInputIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
      }
      // only move right when cursor is at end
      if (cursorPos === inputValue.length && e.key === 'ArrowRight') {
        e.stopPropagation();
        setInputIndex((prevIndex) =>
          prevIndex < value.expression.length ? prevIndex + 1 : prevIndex
        );
      }
      // only remove item on backspace if the input is empty
      if (inputValue.length === 0 && e.key === 'Backspace') {
        e.stopPropagation();
        setValue({
          expression: value.expression.filter((_, i) => i !== inputIndex - 1),
        });
        setError(undefined);
        setInputIndex((prevIndex) => prevIndex + -1);
      }
      // allow selecting operators, channels, strings
      // and numbers with Space key down

      const otherListItems = [...functions, ...channels];
      if (e.key === ' ') {
        const operatorExactMatch = operators.find(
          (opt) => opt.value === inputValue
        );
        const otherListItem = otherListItems.filter((listItem) =>
          listItem.label.toLowerCase().startsWith(inputValue.toLowerCase())
        );
        const operatorListMatch = operators.filter((opt) =>
          opt.value.toLowerCase().startsWith(inputValue.toLowerCase())
        );

        const newValue = [...value.expression];
        let newToken;

        switch (true) {
          case otherListItem.length === 1:
            newToken = otherListItem[0];
            break;

          case operatorExactMatch !== undefined:
            newToken = operatorExactMatch;
            break;

          case operatorListMatch.length === 1:
            newToken = operatorListMatch[0];
            break;

          case !Number.isNaN(Number(inputValue)) &&
            inputValue.trim().length > 0:
            newToken = {
              type: 'number',
              value: inputValue,
              label: inputValue,
            };
            break;

          default:
            break;
        }

        if (typeof newToken !== 'undefined') {
          e.preventDefault();
          e.stopPropagation();
          newValue.splice(inputIndex, 0, newToken as FunctionToken);
          setValue({ expression: newValue });
          setInputValue('');
          setError(undefined);
          setInputIndex((prevIndex) => prevIndex + 1);
        }
      }
    },
    [
      inputValue,
      value,
      setValue,
      setError,
      operators,
      inputIndex,
      channels,
      functions,
    ]
  );

  const clickHandler = React.useCallback<(e: React.MouseEvent) => void>(
    (e) => {
      const target = e.target as HTMLElement;
      if (target.dataset.id === 'Input') {
        const children = Array.from(target.children);
        let newInputPosition = 0;
        for (let i = 0; i < children.length; i++) {
          if (i !== inputIndex) {
            const { x, y, width, height } = children[i].getBoundingClientRect();
            // add 4 to y to account for vertical padding between lines of tags
            if (e.clientX < x + width / 2 && e.clientY < y + 4 + height / 2) {
              newInputPosition = i;
              break;
            } else {
              // previous calcs miss the case when we overflow to a new line
              if (i > 0) {
                const { x: prevX, y: prevY } =
                  children[i - 1].getBoundingClientRect();
                if (
                  x < prevX &&
                  y > prevY &&
                  e.clientY < prevY + 4 + height / 2
                ) {
                  newInputPosition = i;
                  break;
                } else {
                  newInputPosition = i + 1;
                }
              } else {
                newInputPosition = i + 1;
              }
            }
          }
        }
        // need to take the input itself into account when we move forwards so minus 1 off
        if (newInputPosition > inputIndex) {
          newInputPosition--;
        }
        setInputIndex(newInputPosition);
      }
    },
    [inputIndex]
  );

  let tags: React.ReactElement[] = [];

  const [flashAnimationPlaying, setFlashAnimationPlaying] =
    React.useState<boolean>(!!flashingFunctionValue);

  // Stop the flash animation from playing after 1500ms
  // This ensures the chip doesn't flash every time it is selected from the autocomplete
  setTimeout(() => {
    setFlashAnimationPlaying(false);
  }, FLASH_ANIMATION.length);

  return (
    <Grid container spacing={1}>
      <Grid item xs={6}>
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
      <Grid item xs={6}>
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
          value={value.expression}
          onChange={(
            event: unknown,
            newValue: (string | FunctionToken)[],
            reason: string
          ) => {
            // need to move last item in newValue (the newly added token)
            // to the position matching the input
            if (reason === 'createOption' || reason === 'selectOption') {
              // below will always be non-null, as createOption/selectOption implies that
              // newValue is at least of length 1
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const newToken = newValue.pop()!;
              newValue.splice(inputIndex, 0, newToken);
            }
            // createOption implies a value which is not in options so either
            // a number, a string (surrounded by quotes) or we should reject
            if (reason === 'createOption') {
              // newTerm is a string not a FunctionOperator so use that fact to find it (and it means we can safely cast here)
              const newTerm = newValue.find(
                (v) => typeof v === 'string'
              ) as string;
              const newTermIndex = newValue.indexOf(newTerm);
              // new term is a valid number so allow it to be added
              if (
                !Number.isNaN(Number(newTerm)) &&
                inputValue.trim().length > 0
              ) {
                newValue[newTermIndex] = {
                  type: 'number',
                  value: newTerm,
                  label: newTerm,
                };
                setValue({ expression: newValue as FunctionToken[] });

                setInputIndex((prevIndex) => prevIndex + 1);
              } // new term is a string specified by either single or double quotes so allow it
              else {
                // otherwise don't add the new term & leave it in textbox
                setInputValue(newTerm);
              }
            } else {
              setValue({ expression: newValue as FunctionToken[] });
            }
            if (reason === 'selectOption') {
              setInputIndex((prevIndex) => prevIndex + 1);
            }
            if (reason === 'removeOption') {
              // need to find out which option was removed i.e. before or after input
              // so we can determine whether to move input
              let removedIndex = -1;
              value.expression.forEach((v, i) => {
                if (!newValue.includes(v)) removedIndex = i;
              });
              setInputIndex((prevIndex) => {
                return prevIndex > removedIndex ? prevIndex - 1 : prevIndex;
              });
            }
          }}
          // this is need to allow user to repeatedly select the same tag
          isOptionEqualToValue={(option, value) => false}
          renderTags={(value, getTagProps) => {
            tags = value.map((option: FunctionToken, index: number) => (
              <Chip
                label={option.label}
                size="small"
                sx={{
                  ...(flashAnimationPlaying &&
                    flashingFunctionValue === option.value && {
                      animation: `${FLASH_ANIMATION.animation} ${FLASH_ANIMATION.length}ms`,
                    }),
                }}
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
