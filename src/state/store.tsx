import {
  configureStore,
  combineReducers,
  PreloadedState,
} from '@reduxjs/toolkit';
import OperationsGatewayMiddleware, {
  listenToMessages,
} from './middleware/operationsgateway.middleware';
import configReducer from './slices/configSlice';
import tableReducer from './slices/tableSlice';
import searchReducer from './slices/searchSlice';

const rootReducer = combineReducers({
  config: configReducer,
  table: tableReducer,
  search: searchReducer,
});

export function setupStore(preloadedState?: PreloadedState<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(OperationsGatewayMiddleware),
  });
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

export const store = setupStore();

listenToMessages(store.dispatch);
