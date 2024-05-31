import { createSlice, createSelector } from '@reduxjs/toolkit';
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
    setSelectedRows: (
      state,
      action: PayloadAction<Record<string, boolean>>
    ) => {
      state.selectedRows = Object.keys(action.payload);
    },
  },
});

export const { setSelectedRows } = selectionSlice.actions;

export const selectSelectedRows = (state: RootState) =>
  state.selection?.selectedRows;

export const selectSelectedRowsObject = createSelector(
  [selectSelectedRows],
  (selectedRows) => {
    if (!selectedRows) return {};
    return selectedRows.reduce(
      (obj: Record<string, boolean>, rowId: string) => {
        obj[rowId] = true;
        return obj;
      },
      {}
    );
  }
);

export default selectionSlice.reducer;
