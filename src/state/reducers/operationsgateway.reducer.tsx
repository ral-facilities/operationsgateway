import {
  ConfigureURLsPayload,
  ConfigureURLsType,
} from '../actions/actions.types';
import { OperationsGatewayState } from '../state.types';
import createReducer from './createReducer';

export const initialState: OperationsGatewayState = {
  urls: {
    apiUrl: '',
  },
};

export function handleConfigureUrls(
  state: OperationsGatewayState,
  payload: ConfigureURLsPayload
): OperationsGatewayState {
  return {
    ...state,
    urls: payload.urls,
  };
}

const operationsGatewayReducer = createReducer(initialState, {
  [ConfigureURLsType]: handleConfigureUrls,
});

export default operationsGatewayReducer;
