import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';

export interface URLs {
  apiUrl: string;
}

export interface OperationsGatewayState {
  urls: URLs;
}

export interface ActionType<T> {
  type: string;
  payload: T;
}

export type ThunkResult<R> = ThunkAction<
  R,
  OperationsGatewayState,
  null,
  AnyAction
>;
