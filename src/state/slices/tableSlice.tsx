import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Column } from 'react-table';
import { DropResult } from 'react-beautiful-dnd';
import { RootState } from '../store';
import { ColumnState, Order, FullChannelMetadata } from '../../app.types';

export const resultsPerPage = 25;

// Define a type for the slice state
interface TableState {
  columnStates: {
    [id: string]: ColumnState;
  };
  // selectedColumnIds stores info for both what columns are selected and also
  // the order that the user wants the columns in
  selectedColumnIds: string[];
  page: number;
  resultsPerPage: number;
  sort: {
    [column: string]: Order;
  };
}

// Define the initial state using that type
export const initialState = {
  columnStates: {},
  selectedColumnIds: [],
  page: 0,
  resultsPerPage: resultsPerPage,
  sort: {},
} as TableState;

export const tableSlice = createSlice({
  name: 'table',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    selectColumn: (state, action: PayloadAction<string>) => {
      // if it's the timestamp column, add to the beginning of the array
      if (action.payload === 'timestamp') {
        state.selectedColumnIds.unshift(action.payload);
      } else {
        state.selectedColumnIds.push(action.payload);
      }
    },
    deselectColumn: (state, action: PayloadAction<string>) => {
      delete state.sort[action.payload];

      const newSelectedColumnsIds = state.selectedColumnIds.filter(
        (colId) => colId !== action.payload
      );
      state.selectedColumnIds = newSelectedColumnsIds;
    },
    reorderColumn: (state, action: PayloadAction<DropResult>) => {
      const result = action.payload;
      if (result.destination) {
        const [reorderedItem] = state.selectedColumnIds.splice(
          result.source.index,
          1
        );
        state.selectedColumnIds.splice(
          result.destination?.index,
          0,
          reorderedItem
        );
      }
    },
    changeSort: (
      state,
      action: PayloadAction<{ column: string; order: Order | null }>
    ) => {
      const { column, order } = action.payload;
      if (order !== null) {
        state.sort[column] = order;
      } else {
        delete state.sort[column];
      }
    },
    changePage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    changeResultsPerPage: (state, action: PayloadAction<number>) => {
      state.resultsPerPage = action.payload;
      state.page = 0;
    },
    toggleWordWrap: (state, action: PayloadAction<string>) => {
      if (state.columnStates[action.payload]) {
        state.columnStates[action.payload].wordWrap =
          !state.columnStates[action.payload].wordWrap;
      } else {
        state.columnStates[action.payload] = { wordWrap: true };
      }
    },
  },
});

export const {
  selectColumn,
  deselectColumn,
  reorderColumn,
  changeSort,
  changePage,
  changeResultsPerPage,
  toggleWordWrap,
} = tableSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectColumnStates = (state: RootState) =>
  state.table.columnStates;
export const selectAvailableColumns = (
  state: RootState,
  availableColumns: Column[]
) => availableColumns;
export const selectAvailableChannels = (
  state: RootState,
  availableChannels: FullChannelMetadata[]
) => availableChannels;
export const selectSelectedIds = (state: RootState) =>
  state.table.selectedColumnIds;
export const selectSort = (state: RootState) => state.table.sort;
export const selectPage = (state: RootState) => state.table.page;
export const selectResultsPerPage = (state: RootState) =>
  state.table.resultsPerPage;

function arrayEquals(a: string[], b: string[]) {
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return (
    Array.isArray(sortedA) &&
    Array.isArray(sortedB) &&
    sortedA.length === sortedB.length &&
    sortedA.every((val, index) => val === sortedB[index])
  );
}

/**
 * @returns A selector for an array of column ids which are currently selected,
 * which only changes when a column is selected/deselected and not when columns are reordered
 *
 * For selectSelectedColumns and selectHiddenChannels, these don't are about the
 * order of selectedIds, and if they changed when the order of columns changed
 * then there would be unnecessary rerendering where selectedColumns/hiddenColumns
 * are used. We use memoizeOptions to pass the arrayEquals function to check
 * whether selectedIds has changed if you ignore order.
 */
const selectSelectedIdsIgnoreOrder = createSelector(
  selectSelectedIds,
  (selectedIds) => selectedIds,
  {
    memoizeOptions: { equalityCheck: arrayEquals },
  }
);

/**
 * @returns A selector for an array of Column objects which are currently selected,
 * which only changes when a column is selected/deselected and not when columns are reordered
 * @params state - the current redux state
 * @params availableColumns - array of all the columns the user can select
 */
export const selectSelectedChannels = createSelector(
  selectAvailableChannels,
  selectSelectedIdsIgnoreOrder,
  (availableChannels, selectedIds) => {
    return availableChannels.filter((channel: FullChannelMetadata) => {
      return selectedIds.includes(channel.systemName);
    });
  }
);

/**
 * @returns A selector for an array of Column objects which are currently ___not___ selected,
 * which only changes when a column is selected/deselected and not when columns are reordered
 * @params state - the current redux state
 * @params availableColumns - array of all the columns the user can select
 */
export const selectHiddenColumns = createSelector(
  selectAvailableColumns,
  selectSelectedIdsIgnoreOrder,
  (availableColumns, selectedIds) => {
    return availableColumns
      .filter((col) => {
        return !selectedIds.includes(col.accessor?.toString() ?? '');
      })
      .map((col) => col.accessor?.toString() ?? '');
  }
);

export default tableSlice.reducer;
