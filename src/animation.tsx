import { type Keyframes, keyframes } from '@emotion/react';

type Animation = {
  animation: Keyframes;
  length: number;
};

// Flash animation
// Highlights chips in the autocomplete as well as elements of search components
const flash = keyframes`
  0% {
    background-color: #67becc;
  }
  100% {
    background-color: #ebebeb;
  }
`;
const flashAnimationLength = 1500; // milliseconds

export const FLASH_ANIMATION: Animation = {
  animation: flash,
  length: flashAnimationLength,
};
