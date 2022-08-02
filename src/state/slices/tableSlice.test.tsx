import ColumnsReducer, {
  changeSort,
  deselectColumn,
  initialState,
  reorderColumn,
  selectColumn,
  selectHiddenColumns,
} from './tableSlice';

describe('tableSlice', () => {
  // only test the hard to test bits of columnSlice here - like column reordering logic
  describe('Reducer', () => {
    let state: typeof initialState;

    beforeEach(() => {
      state = initialState;
    });

    it('selectColumn adds new columns in the correct order', () => {
      state = ColumnsReducer(state, selectColumn('shotnum'));
      expect(state.selectedColumnIds).toEqual(['shotnum']);

      state = ColumnsReducer(state, selectColumn('timestamp'));
      expect(state.selectedColumnIds).toEqual(['timestamp', 'shotnum']);

      state = ColumnsReducer(state, selectColumn('activeArea'));
      expect(state.selectedColumnIds).toEqual([
        'timestamp',
        'shotnum',
        'activeArea',
      ]);
    });

    it('deselectColumn removes columns in the correct order', () => {
      state = {
        ...state,
        selectedColumnIds: [
          'timestamp',
          'shotnum',
          'activeArea',
          'activeExperiment',
        ],
      };
      state = ColumnsReducer(state, deselectColumn('activeArea'));
      expect(state.selectedColumnIds).toEqual([
        'timestamp',
        'shotnum',
        'activeExperiment',
      ]);
    });

    it('should reorder columns correctly when reorderColumns action is sent', () => {
      state = {
        ...state,
        selectedColumnIds: [
          'timestamp',
          'shotnum',
          'activeArea',
          'activeExperiment',
        ],
      };

      // Swap Shot Number and Active Area
      const draggedColumn = {
        source: {
          index: 1,
        },
        destination: {
          index: 2,
        },
      };

      const updatedState = ColumnsReducer(state, reorderColumn(draggedColumn));
      expect(updatedState.selectedColumnIds).toEqual([
        'timestamp',
        'activeArea',
        'shotnum',
        'activeExperiment',
      ]);
    });

    it('should update sort correctly when changeSort action is sent', () => {
      state = ColumnsReducer(
        state,
        changeSort({ column: 'timestamp', order: 'asc' })
      );
      expect(state.sort).toEqual({ timestamp: 'asc' });

      state = ColumnsReducer(
        state,
        changeSort({ column: 'shotnum', order: 'desc' })
      );
      expect(state.sort).toEqual({ timestamp: 'asc', shotnum: 'desc' });

      state = ColumnsReducer(
        state,
        changeSort({ column: 'timestamp', order: null })
      );
      expect(state.sort).toEqual({ shotnum: 'desc' });
    });
  });

  describe('Selectors', () => {
    let state: { table: typeof initialState };

    beforeEach(() => {
      state = { table: initialState };
    });

    /**
     * Test that the memoization of selectSelectedIdsIgnoreOrder works and that
     * reordering columns does not cause updates to selectHiddenColumns (which
     * saves on rerenders)
     */
    it('hidden columns selector ignores order of selectedColumnIds', () => {
      const availableColumns = [
        { accessor: '1' },
        { accessor: '2' },
        { accessor: '3' },
        { accessor: '4' },
        { accessor: '5' },
      ];
      state = {
        table: {
          ...state.table,
          selectedColumnIds: ['1', '2', '3'],
        },
      };
      expect(selectHiddenColumns(state, availableColumns)).toStrictEqual([
        '4',
        '5',
      ]);

      // Swap
      let draggedColumn = {
        source: {
          index: 0,
        },
        destination: {
          index: 1,
        },
      };
      state = {
        table: ColumnsReducer(state.table, reorderColumn(draggedColumn)),
      };

      expect(selectHiddenColumns(state, availableColumns)).toStrictEqual([
        '4',
        '5',
      ]);

      expect(selectHiddenColumns.recomputations()).toBe(1);

      // Swap
      draggedColumn = {
        source: {
          index: 0,
        },
        destination: {
          index: 2,
        },
      };
      state = {
        table: ColumnsReducer(state.table, reorderColumn(draggedColumn)),
      };

      expect(selectHiddenColumns(state, availableColumns)).toStrictEqual([
        '4',
        '5',
      ]);

      expect(selectHiddenColumns.recomputations()).toBe(1);
    });
  });
});
