import { configureStore } from '@reduxjs/toolkit';
import operationsGatewayReducer from './reducers/operationsgateway.reducer';

export default configureStore({
  reducer: operationsGatewayReducer,
});
