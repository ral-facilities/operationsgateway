import {
  Autocomplete,
  Chip,
  TextField,
  Theme,
  autocompleteClasses,
  createFilterOptions,
} from '@mui/material';
import React from 'react';
import { FLASH_ANIMATION } from '../animation';
import { FunctionToken } from '../app.types';
import { ParserError, Token, operators, parseFilter } from './filterParser';

interface FilterInputProps {
  channels: Token[];
  favouriteFilter: Token[];
  value: Token[];
  setValue: (value: Token[]) => void;
  error?: string;
  setError: (error?: string) => void;
  flashingFilterValue?: string;
  readOnly?: boolean;
  updateInputIndex?: number;
}

export const useClickHandler = (props: {
  setInputIndex: (value: React.SetStateAction<number>) => void;
  inputIndex: number;
}) =>
  React.useCallback<(e: React.MouseEvent) => void>(
    (e) => {
      const { setInputIndex, inputIndex } = props;
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
    [props]
  );

interface TokenBase {
  value: string;
  label: string;
}

interface UseKeydownHandlerProps<T extends TokenBase> {
  inputValue: string;
  inputIndex: number;
  setInputIndex: (value: React.SetStateAction<number>) => void;
  value: T[];
  setValue: (value: T[]) => void;
  setError: (error: string | undefined) => void;
  options: T[];
  operators: T[];
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  enableCustomStringHandling: boolean;
}

export const useKeydownHandler = <T extends TokenBase>({
  inputValue,
  inputIndex,
  setInputIndex,
  value,
  setValue,
  setError,
  options,
  operators,
  setInputValue,
  enableCustomStringHandling = true,
}: UseKeydownHandlerProps<T>) =>
  React.useCallback(
    (e: React.KeyboardEvent) => {
      const cursorPos = (e.target as HTMLInputElement).selectionStart;

      // Only move left when cursor is at start
      if (cursorPos === 0 && e.key === 'ArrowLeft') {
        e.stopPropagation();
        setInputIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
      }

      // Only move right when cursor is at end
      if (cursorPos === inputValue.length && e.key === 'ArrowRight') {
        e.stopPropagation();
        setInputIndex((prevIndex) =>
          prevIndex < value.length ? prevIndex + 1 : prevIndex
        );
      }

      // Only remove item on backspace if the input is empty
      if (inputValue.length === 0 && e.key === 'Backspace') {
        e.stopPropagation();
        setValue(value.filter((_, i) => i !== inputIndex - 1));
        setError(undefined);
        setInputIndex((prevIndex) => prevIndex - 1);
      }

      // Allow selecting operators, channels, strings, and numbers with Space key
      if (e.key === ' ') {
        const operatorExactMatch = operators.find(
          (opt) => opt.value === inputValue
        );
        const otherOption = options.filter((option) =>
          option.label.toLowerCase().startsWith(inputValue.toLowerCase())
        );
        const operatorListMatch = operators.filter((opt) =>
          opt.value.toLowerCase().startsWith(inputValue.toLowerCase())
        );

        const newValue = [...value];
        let newToken: T | undefined;

        switch (true) {
          case otherOption.length === 1:
            newToken = otherOption[0];
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
            } as unknown as T;
            break;

          case (enableCustomStringHandling &&
            inputValue.startsWith('"') &&
            inputValue.endsWith('"')) ||
            (inputValue.startsWith("'") && inputValue.endsWith("'")):
            newToken = {
              type: 'string',
              value: inputValue,
              label: inputValue,
            } as unknown as T;
            break;

          default:
            break;
        }

        if (newToken) {
          e.preventDefault();
          e.stopPropagation();
          newValue.splice(inputIndex, 0, newToken);
          setValue(newValue);
          setInputValue('');
          setError(undefined);
          setInputIndex((prevIndex) => prevIndex + 1);
        }
      }
    },
    [
      inputValue,
      setInputIndex,
      value,
      setValue,
      setError,
      inputIndex,
      operators,
      options,
      enableCustomStringHandling,
      setInputValue,
    ]
  );

interface UseOnChangeProps<T> {
  inputValue: string;
  setInputValue: (value: string) => void;
  setValue: (value: T[]) => void;
  setInputIndex: (value: React.SetStateAction<number>) => void;
  setError: (error?: string) => void;
  value: T[];
  inputIndex: number;
  enableCustomStringHandling: boolean;
}

export const useOnChange = <T extends Token | FunctionToken>({
  inputValue,
  setInputValue,
  setValue,
  setInputIndex,
  setError,
  value,
  inputIndex,
  enableCustomStringHandling = true,
}: UseOnChangeProps<T>) =>
  React.useCallback(
    (_event: unknown, newValue: (string | T)[], reason: string) => {
      if (reason === 'createOption' || reason === 'selectOption') {
        const newToken = newValue.pop()!;
        newValue.splice(inputIndex, 0, newToken);
      }

      if (reason === 'createOption') {
        const newTerm = newValue.find((v) => typeof v === 'string') as string;
        const newTermIndex = newValue.indexOf(newTerm);

        if (!Number.isNaN(Number(newTerm)) && inputValue.trim().length > 0) {
          newValue[newTermIndex] = {
            type: 'number',
            value: newTerm,
            label: newTerm,
          } as T;
          setValue(newValue as T[]);
          setError(undefined);
          setInputIndex((prevIndex) => prevIndex + 1);
        } else if (
          (enableCustomStringHandling &&
            newTerm[0] === '"' &&
            newTerm[newTerm.length - 1] === '"') ||
          (newTerm[0] === "'" && newTerm[newTerm.length - 1] === "'")
        ) {
          newValue[newTermIndex] = {
            type: 'string',
            value: newTerm,
            label: newTerm,
          } as T;
          setValue(newValue as T[]);
          setError(undefined);
          setInputIndex((prevIndex) => prevIndex + 1);
        } else {
          setInputValue(newTerm);
        }
      } else {
        setValue(newValue as T[]);
        setError(undefined);
      }

      if (reason === 'selectOption') {
        // Check if any of the selected tokens is a 'favouriteFilter'
        const favouriteFilterTokens = (newValue as T[]).filter(
          (token) => token.type === 'favouriteFilter'
        );

        // If we have any favourite filters, parse the value of the last one
        if (favouriteFilterTokens.length > 0) {
          const lastFavouriteFilter =
            favouriteFilterTokens[favouriteFilterTokens.length - 1]; // Get the last favourite filter for demonstration
          const parsedValue: Token[] = JSON.parse(lastFavouriteFilter.value); // Parse the value of the last favourite filter
          const cursorPositionChange = parsedValue.length; // Length of the parsed value

          // Move the cursor by the length of the parsed value
          setInputIndex((prevIndex) => prevIndex + cursorPositionChange);
        } else {
          setInputIndex((prevIndex) => prevIndex + 1); // Move cursor for other cases
        }
      }

      if (reason === 'removeOption') {
        let removedIndex = -1;
        value.forEach((v, i) => {
          if (!newValue.includes(v)) removedIndex = i;
        });
        setInputIndex((prevIndex) =>
          prevIndex > removedIndex ? prevIndex - 1 : prevIndex
        );
      }
    },
    [
      inputIndex,
      inputValue,
      enableCustomStringHandling,
      setValue,
      setError,
      setInputIndex,
      setInputValue,
      value,
    ]
  );
// use matchFrom start here as otherwise it's hard to input e.g. the number 1 as there
// are channels with that in their name. It also matches eCat behaviour - but we should
// check if this is desired.
const filterOptions = createFilterOptions<Token>({
  matchFrom: 'start',
  limit: 100,
});

const FilterInput = (props: FilterInputProps) => {
  const {
    channels,
    value,
    setValue,
    error,
    setError,
    flashingFilterValue,
    readOnly,
    favouriteFilter,
    updateInputIndex,
  } = props;

  const autocompleteOptions = React.useMemo(() => {
    const groupedOptions = [
      ...favouriteFilter.map((option) => ({
        ...option,
      })),
      ...operators.map((option) => ({ ...option })),
      ...channels.map((option) => ({ ...option })),
    ];

    return groupedOptions;
  }, [channels, favouriteFilter]);

  const [inputValue, setInputValue] = React.useState<string>('');
  // on load, set input position to the end
  const [inputIndex, setInputIndex] = React.useState<number>(value.length);

  React.useEffect(() => {
    if (updateInputIndex) {
      setInputIndex(updateInputIndex);
    }
  }, [updateInputIndex]);

  const keydownHandler = useKeydownHandler<Token>({
    inputValue,
    inputIndex,
    setInputIndex,
    value,
    setValue,
    setError,
    options: [...channels, ...favouriteFilter],
    operators,
    setInputValue,
    enableCustomStringHandling: true,
  });

  const clickHandler = useClickHandler({ setInputIndex, inputIndex });

  const onChange = useOnChange<Token>({
    inputValue,
    setInputValue,
    setValue,
    setInputIndex,
    setError,
    value,
    inputIndex,
    enableCustomStringHandling: true,
  });

  let tags: React.ReactElement[] = [];

  const checkErrors = React.useCallback(() => {
    try {
      parseFilter(value);
      setError(undefined);
    } catch (e) {
      if (e instanceof ParserError) setError(e.message);
    }
  }, [value, setError]);

  const [flashAnimationPlaying, setFlashAnimationPlaying] =
    React.useState<boolean>(!!flashingFilterValue);

  // Stop the flash animation from playing after 1500ms
  // This ensures the chip doesn't flash every time it is selected from the autocomplete
  setTimeout(() => {
    setFlashAnimationPlaying(false);
  }, FLASH_ANIMATION.length);

  return (
    <Autocomplete
      autoHighlight
      filterOptions={filterOptions}
      multiple
      readOnly={readOnly}
      options={autocompleteOptions}
      freeSolo
      size="small"
      fullWidth
      inputValue={inputValue}
      onBlur={checkErrors}
      onInputChange={(_event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      value={value}
      onChange={onChange}
      // this is need to allow user to repeatedly select the same tag
      isOptionEqualToValue={() => false}
      renderTags={(value, getTagProps) => {
        tags = value.map((option: Token, index: number) => (
          <Chip
            label={option.label}
            size="small"
            sx={{
              ...(flashAnimationPlaying &&
                flashingFilterValue === option.value && {
                  animation: `${FLASH_ANIMATION.animation} ${FLASH_ANIMATION.length}ms`,
                }),
            }}
            {...getTagProps({ index })}
            key={getTagProps({ index }).key}
          />
        ));
        return null;
      }}
      groupBy={(option) => {
        if (typeof option !== 'string' && option.type === 'favouriteFilter') {
          return 'Favourite Filters';
        }
        if (typeof option !== 'string' && option.type === 'channel') {
          return 'Channels';
        }
        return 'Operators';
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Filter"
          error={(error?.length ?? 0) > 0}
          helperText={error}
          onKeyDown={readOnly ? undefined : keydownHandler}
          onClick={readOnly ? undefined : clickHandler}
          slotProps={{
            input: {
              ...params.InputProps,
              // we need this data-id so we can tell when a user is clicking between
              // tags in clickHander - this is a valid data-* prop so ignore TS
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              'data-id': 'Input',
              startAdornment: tags.slice(0, inputIndex),
              endAdornment: tags.slice(inputIndex),
              readOnly: readOnly,
              disabled: readOnly,
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        // Ensure we use the value and not the label as the key,
        // as theoretically only value has to be unique. However,
        // since a favourite filter value could be duplicate, the name
        // (which is unique) should be appended to it to ensure the key is unique.
        <li
          {...props}
          key={`${option.value}${option.type === 'favouriteFilter' ? option.label : ''}`}
        >
          {option.label}
        </li>
      )}
      slotProps={{
        listbox: {
          sx: (theme: Theme) => ({
            [`& .${autocompleteClasses.option}`]: {
              [`&.Mui-focused,&.Mui-focusVisible`]: {
                backgroundColor: theme.palette.action.focus,
              },
            },
          }),
        },
      }}
    />
  );
};

export default FilterInput;
