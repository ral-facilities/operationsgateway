import { initialState, selectQueryFilters } from './filterSlice';
import { Token } from '../../filtering/filterParser';

describe('filterSlice', () => {
  describe('Selectors', () => {
    let state: { filter: typeof initialState };

    beforeEach(() => {
      state = { filter: initialState };
    });

    it('query filter selector converts token arrays to query strings', () => {
      state = {
        filter: {
          ...state.filter,
          appliedFilters: [
            [
              { type: 'channel', value: 'timestamp' },
              { type: 'unaryop', value: 'is not null' },
            ],
            [
              { type: 'channel', value: 'CHANNEL_1' },
              { type: 'compop', value: '<' },
              { type: 'number', value: '1' },
            ],
          ] as Token[][],
        },
      };
      expect(selectQueryFilters(state)).toEqual([
        '{"metadata.timestamp":{"$ne":null}}',
        '{"channels.CHANNEL_1.data":{"$lt":1}}',
      ]);
    });
  });
});
