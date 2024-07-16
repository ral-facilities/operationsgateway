import { ValidateFunctionState } from '../../app.types';
import { initialState, selectQueryFunctions } from './functionsSlice';

describe('functionsSlice', () => {
  describe('Selectors', () => {
    let state: { functions: typeof initialState };

    const functions: ValidateFunctionState[] = [
      {
        id: '1',
        name: 'a',
        expression: [{ type: 'number', label: '1', value: '1' }],
        dataType: 'scalar',
        channels: [],
      },
      {
        id: '2',
        name: 'b',
        expression: [
          { type: 'number', label: 'a', value: 'a' },
          { type: 'functionToken', label: '+', value: '+' },
          { type: 'number', label: '1', value: '1' },
        ],
        dataType: 'scalar',
        channels: [],
      },
      {
        id: '3',
        name: 'mean',
        expression: [{ type: 'number', label: '1', value: '1' }],
        dataType: 'scalar',
        channels: [],
      },
      {
        id: '4',
        name: 'a',
        expression: [
          { type: 'functionToken', label: 'centre', value: 'centre' },
          { type: 'functionToken', label: '(', value: '(' },
          { type: 'number', label: '1', value: '1' },
          { type: 'functionToken', label: ')', value: ')' },
        ],
        dataType: 'scalar',
        channels: [],
      },
    ];

    beforeEach(() => {
      state = { functions: initialState };
    });

    it('query functions selector converts token arrays to query strings', () => {
      state = {
        functions: {
          ...state.functions,
          appliedFunctions: functions,
        },
      };
      expect(selectQueryFunctions(state)).toEqual([
        { expression: '1', name: 'a' },
        { expression: 'a + 1', name: 'b' },
        { expression: '1', name: 'mean' },
        { expression: 'centre(1)', name: 'a' },
      ]);
    });
  });
});
