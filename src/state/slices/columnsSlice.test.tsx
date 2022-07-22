import ColumnsReducer, {
  initialState,
  reorderColumn,
  selectHiddenColumns,
} from './columnsSlice';
import { actions, resetActions, dispatch } from '../../setupTests';
import { setSettings } from '../../settings';

jest.mock('loglevel');

describe('columnsSlice', () => {
  // only test the hard to test bits of columnSlice here - like column reordering logic
  describe('Reducer', () => {
    let state: typeof initialState;

    beforeEach(() => {
      state = initialState;
    });

    it('should reorder columns correctly when reorderColumns action is sent', () => {
      state = {
        ...state,
        selectedColumnIds: [
          'timestamp',
          'shotNum',
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
        'shotNum',
        'activeExperiment',
      ]);
    });
  });

  describe('Selectors', () => {
    let state: { columns: typeof initialState };

    beforeEach(() => {
      state = { columns: initialState };
    });

    it('hidden columns selector ignores order of selectedColumnIds', () => {
      state = {
        columns: {
          ...state.columns,
          columnDefs: {
            1: { accessor: '1' },
            2: { accessor: '2' },
            3: { accessor: '3' },
            4: { accessor: '4' },
            5: { accessor: '5' },
          },
          selectedColumnIds: ['1', '2', '3'],
        },
      };
      expect(selectHiddenColumns(state)).toStrictEqual(['4', '5']);

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
        columns: ColumnsReducer(state.columns, reorderColumn(draggedColumn)),
      };

      expect(selectHiddenColumns(state)).toStrictEqual(['4', '5']);

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
        columns: ColumnsReducer(state.columns, reorderColumn(draggedColumn)),
      };

      expect(selectHiddenColumns(state)).toStrictEqual(['4', '5']);

      expect(selectHiddenColumns.recomputations()).toBe(1);
    });
  });
});
