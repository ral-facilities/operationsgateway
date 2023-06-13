import {
  configureStore,
  combineReducers,
  PreloadedState,
  AnyAction,
  Reducer,
  createAction,
} from '@reduxjs/toolkit';
import OperationsGatewayMiddleware, {
  listenToMessages,
} from './middleware/operationsgateway.middleware';
import configReducer from './slices/configSlice';
import tableReducer from './slices/tableSlice';
import searchReducer from './slices/searchSlice';
import plotReducer from './slices/plotSlice';
import filterReducer from './slices/filterSlice';
import windowsReducer from './slices/windowSlice';

export const importSession =
  createAction<Omit<RootState, 'config'>>('IMPORT_SESSION');

const sliceReducer = combineReducers({
  config: configReducer,
  table: tableReducer,
  search: searchReducer,
  plots: plotReducer,
  filter: filterReducer,
  windows: windowsReducer,
});

const rootReducer: Reducer = (state: RootState, action: AnyAction) =>
  action.type === importSession.toString()
    ? { ...action.payload, config: state.config } // load new state
    : sliceReducer(state, action); //defer to original reducer

export function setupStore(preloadedState?: PreloadedState<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(OperationsGatewayMiddleware),
  });
}

export type RootState = ReturnType<typeof sliceReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

export const store = setupStore();

listenToMessages(store.dispatch);
