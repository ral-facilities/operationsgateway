import { configureStore } from '@reduxjs/toolkit';
import OperationsGatewayMiddleware, {
  listenToMessages,
} from './middleware/operationsgateway.middleware';
import configReducer from './slices/configSlice';

export const store = configureStore({
  reducer: {
    config: configReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(OperationsGatewayMiddleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

listenToMessages(store.dispatch);
