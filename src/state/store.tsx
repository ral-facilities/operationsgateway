import {
  Reducer,
  UnknownAction,
  combineReducers,
  configureStore,
  createAction,
  isAction,
} from '@reduxjs/toolkit';
import OperationsGatewayMiddleware, {
  listenToMessages,
} from './middleware/operationsgateway.middleware';
import configReducer from './slices/configSlice';
import filterReducer from './slices/filterSlice';
import functionsReducer from './slices/functionsSlice';
import plotReducer from './slices/plotSlice';
import searchReducer from './slices/searchSlice';
import selectionReducer from './slices/selectionSlice';
import tableReducer from './slices/tableSlice';
import windowsReducer from './slices/windowSlice';

export const importSession = createAction<ImportSessionType>('IMPORT_SESSION');

export type ImportSessionType = Omit<RootState, 'config'>;

const sliceReducer = combineReducers({
  config: configReducer,
  table: tableReducer,
  search: searchReducer,
  plots: plotReducer,
  filter: filterReducer,
  functions: functionsReducer,
  windows: windowsReducer,
  selection: selectionReducer,
});

const rootReducer: Reducer = (state: RootState, action: UnknownAction) => {
  if (isAction(action)) {
    if (importSession.match(action)) {
      if (action.payload.search.searchParams.maxShots === null)
        action.payload.search.searchParams.maxShots = Infinity;

      return {
        ...action.payload,
        config: state.config,
      }; // load new state
    } else {
      return sliceReducer(state, action); //defer to original reducer
    }
  }
};

export function setupStore(preloadedState?: Partial<RootState>) {
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
