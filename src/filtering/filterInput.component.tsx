import {
  Autocomplete,
  TextField,
  createFilterOptions,
  autocompleteClasses,
  useAutocomplete,
  AutocompleteGetTagProps,
  Theme,
  SxProps,
  Box,
  styled,
  Input,
  Chip,
  FormHelperText,
} from '@mui/material';
import React from 'react';
import { Token, ParserError, operators, parseFilter } from './filterParser';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const Root = styled('div')(
  ({ theme }) => `
  color: ${
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,.85)'
  };
  font-size: 14px;
`
);

const Label = styled('label')`
  padding: 0 0 4px;
  line-height: 1.5;
  display: block;
`;

const InputWrapper = styled('div')(
  ({ theme }) => `
  width: 300px;
  border: 1px solid ${theme.palette.mode === 'dark' ? '#434343' : '#d9d9d9'};
  background-color: ${theme.palette.mode === 'dark' ? '#141414' : '#fff'};
  border-radius: 4px;
  padding: 1px;
  display: flex;
  flex-wrap: wrap;
  cursor: text;

  &:hover {
    border-color: ${theme.palette.mode === 'dark' ? '#177ddc' : '#40a9ff'};
  }

  &.focused {
    border-color: ${theme.palette.mode === 'dark' ? '#177ddc' : '#40a9ff'};
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  & input {
    background-color: ${theme.palette.mode === 'dark' ? '#141414' : '#fff'};
    color: ${
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.65)'
        : 'rgba(0,0,0,.85)'
    };
    height: 30px;
    box-sizing: border-box;
    padding: 4px 6px;
    width: 0;
    min-width: 30px;
    flex-grow: 1;
    border: 0;
    margin: 0;
    outline: 0;
  }
`
);

const Listbox = styled('ul')(
  ({ theme }) => `
  width: 300px;
  margin: 2px 0 0;
  padding: 0;
  position: absolute;
  list-style: none;
  background-color: ${theme.palette.mode === 'dark' ? '#141414' : '#fff'};
  overflow: auto;
  max-height: 250px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;

  & li {
    padding: 5px 12px;
    display: flex;

    & span {
      flex-grow: 1;
    }

    & svg {
      color: transparent;
    }
  }

  & li[aria-selected='true'] {
    background-color: ${theme.palette.mode === 'dark' ? '#2b2b2b' : '#fafafa'};
    font-weight: 600;

    & svg {
      color: #1890ff;
    }
  }

  & li.${autocompleteClasses.focused} {
    background-color: ${theme.palette.mode === 'dark' ? '#003b57' : '#e6f7ff'};
    cursor: pointer;

    & svg {
      color: currentColor;
    }
  }
`
);

function CustomizedHook(props: FilterInputProps) {
  const { channels, value, setValue, error, setError } = props;
  const options = React.useMemo(() => {
    return [...operators, ...channels];
  }, [channels]);
  const [inputValue, setInputValue] = React.useState<string>('');
  const [inputIndex, setInputIndex] = React.useState<number>(0);

  const checkErrors = React.useCallback(() => {
    try {
      parseFilter(value);
      setError('');
    } catch (e) {
      if (e instanceof ParserError) setError(e.message);
    }
  }, [value, setError]);

  const inputRef = React.useRef<HTMLInputElement>(null);

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
          prevIndex < value.length ? prevIndex + 1 : prevIndex
        );
      }
      // only remove item on backspace if the input is empty
      if (inputValue.length === 0 && e.key === 'Backspace') {
        e.stopPropagation();
        setValue(value.filter((_, i) => i !== inputIndex - 1));
        setError('');
        setInputIndex((prevIndex) => prevIndex + -1);
      }
    },
    [inputIndex, value, inputValue, setError, setValue]
  );

  const clickHandler = React.useCallback<(e: React.MouseEvent) => void>(
    (e) => {
      const target = e.target as HTMLElement;
      if (target.dataset.id === 'inputWrapper') {
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

  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    focused,
    setAnchorEl,
  } = useAutocomplete({
    id: 'customized-hook-demo',
    multiple: true,
    options,
    value,
    inputValue,
    autoHighlight: true,
    freeSolo: true,
    filterOptions,
    onInputChange: (event, newInputValue) => {
      setInputValue(newInputValue);
    },
    onChange: (
      event: unknown,
      newValue: (string | Token)[],
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
          setInputIndex((prevIndex) => prevIndex + 1);
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
          setInputIndex((prevIndex) => prevIndex + 1);
        } else {
          // otherwise don't add the new term & leave it in textbox
          setInputValue(newTerm);
        }
      } else {
        setValue(newValue as Token[]);
        setError('');
      }
      if (reason === 'selectOption') {
        setInputIndex((prevIndex) => prevIndex + 1);
      }
      if (reason === 'removeOption') {
        // need to find out which option was removed i.e. before or after input
        // so we can determine whether to move input
        let removedIndex = -1;
        value.forEach((v, i) => {
          if (!newValue.includes(v)) removedIndex = i;
        });
        setInputIndex((prevIndex) => {
          return prevIndex > removedIndex ? prevIndex - 1 : prevIndex;
        });
      }
    },
    isOptionEqualToValue: (option, value) => false,
  });

  const tags = value.map((option: Token, index: number) => (
    <Chip
      label={option.label}
      size="small"
      sx={{ alignSelf: 'center', margin: '0 2px' }}
      {...getTagProps({ index })}
    />
  ));

  return (
    <Root onBlur={checkErrors}>
      <div {...getRootProps()}>
        <Label {...getInputLabelProps()}>Customized hook</Label>
        <InputWrapper
          onClick={clickHandler}
          ref={setAnchorEl}
          className={focused ? 'focused' : ''}
          data-id="inputWrapper"
        >
          {tags.slice(0, inputIndex)}
          <input
            ref={inputRef}
            onKeyDown={keydownHandler}
            {...getInputProps()}
          />
          {tags.slice(inputIndex)}
        </InputWrapper>
        {error && <FormHelperText error>{error}</FormHelperText>}
      </div>
      {groupedOptions.length > 0 ? (
        <Listbox {...getListboxProps()}>
          {(groupedOptions as Token[]).map((option, index) => (
            <li {...getOptionProps({ option, index })}>
              <span>{option.label}</span>
              <CheckIcon fontSize="small" />
            </li>
          ))}
        </Listbox>
      ) : null}
    </Root>
  );
}

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
    <>
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
            const newTerm = newValue.find(
              (v) => typeof v === 'string'
            ) as string;
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
    </>
  );
};

// export default FilterInput;
export default CustomizedHook;
