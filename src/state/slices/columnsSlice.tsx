import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Column } from 'react-table';
import { DropResult } from 'react-beautiful-dnd';
import { RootState } from '../store';
import { Order } from '../../app.types';
import { resultsPerPage } from '../../recordGeneration';

// Define a type for the slice state
interface ColumnsState {
  columnDefs: {
    [id: string]: Column;
  };
  selectedColumnIds: string[];
  page: number;
  resultsPerPage: number;
  sort: {
    [column: string]: Order;
  };
}

// Define the initial state using that type
export const initialState = {
  columnDefs: {},
  selectedColumnIds: [],
  page: 0,
  resultsPerPage: resultsPerPage,
  sort: {},
} as ColumnsState;

export const columnsSlice = createSlice({
  name: 'columns',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setColumns: (state, action: PayloadAction<Column[]>) => {
      // reduce the collection by the id property into a shape of { 1: { ...user }}
      const byId = action.payload.reduce(
        (
          byId: {
            [id: string]: Column;
          },
          col
        ) => {
          byId[col.accessor?.toString() ?? ''] = col;
          return byId;
        },
        {}
      );
      state.columnDefs = byId;
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    setSelectedColumns: (state, action: PayloadAction<Column[]>) => {
      state.selectedColumnIds = action.payload.map(
        (col) => col.accessor?.toString() ?? ''
      );
    },
    selectColumn: (state, action: PayloadAction<string>) => {
      state.selectedColumnIds.push(action.payload);
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
  },
});

export const {
  setColumns,
  setSelectedColumns,
  selectColumn,
  deselectColumn,
  reorderColumn,
  changeSort,
  changePage,
  changeResultsPerPage,
} = columnsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectColumnDefs = (state: RootState) => state.columns.columnDefs;
export const selectSelectedIds = (state: RootState) =>
  state.columns.selectedColumnIds;
export const selectSort = (state: RootState) => state.columns.sort;
export const selectPage = (state: RootState) => state.columns.page;
export const selectResultsPerPage = (state: RootState) =>
  state.columns.resultsPerPage;

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

const selectSelectedIdsIgnoreOrder = createSelector(
  selectSelectedIds,
  (selectedIds) => selectedIds,
  {
    memoizeOptions: { equalityCheck: arrayEquals },
  }
);

export const selectSelectedColumns = createSelector(
  selectColumnDefs,
  selectSelectedIdsIgnoreOrder,
  (columnDefs, selectedIds) => {
    return Object.values(columnDefs).filter((col) => {
      if (col.accessor?.toString()) {
        return selectedIds.includes(col.accessor.toString());
      } else {
        return false;
      }
    });
  }
);

export const selectHiddenColumns = createSelector(
  selectColumnDefs,
  selectSelectedIdsIgnoreOrder,
  (columnDefs, selectedIds) => {
    return Object.keys(columnDefs).filter((colId) => {
      return !selectedIds.includes(colId);
    });
  }
);

export const selectAvailableColumns = createSelector(
  selectColumnDefs,
  (columnDefs) => {
    return Object.values(columnDefs);
  }
);

export default columnsSlice.reducer;
