import React from 'react';
import {
  Unstable_NumberInput as BaseNumberInput,
  NumberInputProps,
} from '@mui/base/Unstable_NumberInput';
import { styled } from '@mui/system';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const NumberInput = React.forwardRef(function CustomNumberInput(
  props: NumberInputProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  return (
    <BaseNumberInput
      slots={{
        root: StyledInputRoot,
        input: StyledInput,
        incrementButton: StyledStepperButton,
        decrementButton: StyledStepperButton,
      }}
      slotProps={{
        input: {
          onFocus: (event) => {
            event.target.select();
          },
        },
        incrementButton: {
          children: <ArrowDropUpIcon fontSize="small" />,
          className: 'increment',
          'aria-label': 'increment',
        },
        decrementButton: {
          children: <ArrowDropDownIcon fontSize="small" />,
          className: 'decrement',
          'aria-label': 'decrement',
        },
      }}
      {...props}
      ref={ref}
    />
  );
});

const StyledInputRoot = styled('div')(
  () => `
  display: grid;
  grid-template-columns: 1fr 14px;
  grid-template-rows: 1fr 1fr;
  row-gap: 0px;
  justify-items: end;
`
);

const StyledInput = styled('input')(
  () => `
  grid-column: 1/2;
  grid-row: 1/3;
  font-size: 12;
  line-height: 1.375;
  outline: 0;
  min-width: 0;
  width: 2rem;
  border-width: thin;
  border-bottom-left-radius: 4px;
  border-top-left-radius: 4px;
  text-align: center;

  &:focus-visible {
    outline: 0;
  }
`
);

const StyledStepperButton = styled('button')(
  () => `
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    width: 12px;
    height: 12px;
    font-size: 0.2rem;

      &.increment {
        grid-column: 2/3;
        grid-row: 1/2;
        border-top-right-radius: 4px;
        border: 1px solid;
        border-bottom: 0;
        order: 1;

        &:hover {
          cursor: pointer;
          background-color: #bdbebf
        }
      }

      &.decrement {
        grid-column: 2/3;
        grid-row: 2/3;
        border-bottom-right-radius: 4px;
        border: 1px solid;

        &:hover {
          cursor: pointer;
          background-color: #bdbebf
        }
    }
    `
);

export default NumberInput;
