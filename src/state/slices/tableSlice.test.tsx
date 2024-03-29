import ColumnsReducer, {
  changeSort,
  deselectColumn,
  initialState,
  reorderColumn,
  selectColumn,
  selectColumnVisibility,
} from './tableSlice';

describe('tableSlice', () => {
  describe('Reducer', () => {
    let state: typeof initialState;

    beforeEach(() => {
      state = initialState;
    });

    it('selectColumn adds new columns in the correct order', () => {
      state = ColumnsReducer(state, selectColumn('shotnum'));
      expect(state.selectedColumnIds).toEqual(['timestamp', 'shotnum']);

      state = ColumnsReducer(state, selectColumn('shotnum'));
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

      // shouldn't be able to deselect timestamp
      state = ColumnsReducer(state, deselectColumn('timestamp'));
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
     * reordering columns does not cause updates to selectColumnVisibility (which
     * saves on rerenders)
     */
    it('column visibility selector ignores order of selectedColumnIds', () => {
      const availableColumns = [
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' },
      ];
      state = {
        table: {
          ...state.table,
          selectedColumnIds: ['1', '2', '3'],
        },
      };
      expect(selectColumnVisibility(state, availableColumns)).toStrictEqual({
        1: true,
        2: true,
        3: true,
        4: false,
        5: false,
      });

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

      expect(selectColumnVisibility(state, availableColumns)).toStrictEqual({
        1: true,
        2: true,
        3: true,
        4: false,
        5: false,
      });

      expect(selectColumnVisibility.recomputations()).toBe(1);

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

      expect(selectColumnVisibility(state, availableColumns)).toStrictEqual({
        1: true,
        2: true,
        3: true,
        4: false,
        5: false,
      });

      expect(selectColumnVisibility.recomputations()).toBe(1);
    });
  });
});
