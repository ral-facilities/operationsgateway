import { renderHook, waitFor } from '@testing-library/react';
import { FunctionOperator, ValidateFunctionState } from '../app.types';
import functionTokenJson from '../mocks/functionTokens.json';
import { hooksWrapperWithProviders } from '../setupTests';
import { useFunctionsTokens, useValidateFunctions } from './functions';

describe('useFunctionsTokens', () => {
  it('sends request to fetch functions Tokens and returns successful response', async () => {
    const { result } = renderHook(() => useFunctionsTokens(), {
      wrapper: hooksWrapperWithProviders(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });
    const expected: FunctionOperator[] = functionTokenJson;
    expect(result.current.data).toEqual(expected);
  });

  it.todo(
    'sends axios request to fetch functions tokens and throws an appropriate error on failure'
  );
});

describe('useValidateFunctions', () => {
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
  it('sends request to post functions to validate and returns successful response (1 functions)', async () => {
    const { result } = renderHook(() => useValidateFunctions(), {
      wrapper: hooksWrapperWithProviders(),
    });
    expect(result.current.isIdle).toBe(true);

    result.current.mutate([functions[0]]);

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(result.current.data).toEqual(['scalar']);
  });

  it('sends request to post functions to validate and returns successful response (2 functions)', async () => {
    const { result } = renderHook(() => useValidateFunctions(), {
      wrapper: hooksWrapperWithProviders(),
    });
    expect(result.current.isIdle).toBe(true);

    result.current.mutate([functions[0], functions[1]]);

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(result.current.data).toEqual(['scalar', 'scalar']);
  });

  it('sends request to post functions to validate and returns unsuccessful response (expression)', async () => {
    const { result } = renderHook(() => useValidateFunctions(), {
      wrapper: hooksWrapperWithProviders(),
    });
    expect(result.current.isIdle).toBe(true);

    result.current.mutate([functions[3]]);

    await waitFor(() => {
      expect(result.current.isSuccess).toBeFalsy();
    });

    expect(result.current.error?.response?.data).toEqual({
      detail:
        "Error at index 0: 'centre' accepts {'waveform'} type(s), 'scalar' provided",
    });
  });

  it('sends request to post functions to validate and returns unsuccessful response (name)', async () => {
    const { result } = renderHook(() => useValidateFunctions(), {
      wrapper: hooksWrapperWithProviders(),
    });
    expect(result.current.isIdle).toBe(true);

    result.current.mutate([functions[2]]);

    await waitFor(() => {
      expect(result.current.isSuccess).toBeFalsy();
    });

    expect(result.current.error.response.data).toEqual({
      detail: "Error at index 0: name 'mean' is already a builtin name",
    });
  });
});
