import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Define a type for the slice state
interface SelectionState {
  selectedRows: string[];
}

// Define the initial state using that type
export const initialState = {
  selectedRows: [],
} as SelectionState;

export const selectionSlice = createSlice({
  name: 'selection',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setSelectedRows: (state, action: PayloadAction<string[]>) => {
      state.selectedRows = action.payload;
    },
  },
});

export const { setSelectedRows } = selectionSlice.actions;

export const selectSelectedRows = (state: RootState) =>
  state.selection?.selectedRows;

export default selectionSlice.reducer;
