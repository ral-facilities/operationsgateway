// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { Action } from 'redux';
import { Record } from './app.types';
import { initialState } from './state/reducers/operationsgateway.reducer';
import { OperationsGatewayState } from './state/state.types';

export let actions: Action[] = [];
export let resetActions = (): void => {
  actions = [];
};
export const getState = (): OperationsGatewayState => initialState;
export const dispatch = (action: Action): void | Promise<void> => {
  if (typeof action === 'function') {
    action(dispatch, getState);
    return Promise.resolve();
  } else {
    actions.push(action);
  }
};

export const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve));

export const testRecords: Record[] = [
  {
    id: '1',
    metadata: {
      dataVersion: '1',
      shotNum: 1,
      timestamp: '1',
      activeArea: '1',
      activeExperiment: '1',
    },
    channels: {
      test1: {
        metadata: {
          dataType: {
            units: 'km',
          },
        },
        data: 1,
      },
    },
  },
  {
    id: '2',
    metadata: {
      dataVersion: '1',
      shotNum: 2,
      timestamp: '2',
      activeArea: '2',
      activeExperiment: '2',
    },
    channels: {
      test2: {
        metadata: {
          dataType: {
            units: 'km',
          },
        },
        data: 2,
      },
    },
  },
  {
    id: '3',
    metadata: {
      dataVersion: '3',
      shotNum: 3,
      timestamp: '3',
      activeArea: '3',
      activeExperiment: '3',
    },
    channels: {
      test3: {
        metadata: {
          dataType: {
            units: 'km',
          },
        },
        data: 3,
      },
    },
  },
];
