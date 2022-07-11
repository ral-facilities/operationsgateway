import OperationsGatewayReducer, {
  initialState,
} from './operationsgateway.reducer';
import { OperationsGatewayState } from '../state.types';
import { loadPluginHostSetting, settingsLoaded, loadUrls } from '../actions';

describe('OperationsGateway reducer', () => {
  let state: OperationsGatewayState;

  beforeEach(() => {
    state = initialState;
  });

  it('should return state for actions if does not care about', () => {
    const updatedState = OperationsGatewayReducer(state, {
      type: 'irrelevant action',
    });

    expect(updatedState).toBe(state);
  });

  it('should set settingsLoaded to true when settingsLoaded action is sent', () => {
    expect(state.settingsLoaded).toBe(false);

    const updatedState = OperationsGatewayReducer(state, settingsLoaded());
    expect(updatedState.settingsLoaded).toBe(true);
  });

  it('should set pluginHostSetting when configuring action is sent', () => {
    expect(state.pluginHost).toEqual('');

    const updatedState = OperationsGatewayReducer(
      state,
      loadPluginHostSetting('http://localhost:3000')
    );

    expect(updatedState.pluginHost).toEqual('http://localhost:3000');
  });

  it('should set urls property when configure urls action is sent', () => {
    expect(state.urls.apiUrl).toEqual('');

    const updatedState = OperationsGatewayReducer(
      state,
      loadUrls({
        ...state.urls,
        apiUrl: 'test.api.url',
      })
    );

    expect(updatedState.urls.apiUrl).toEqual('test.api.url');
  });
});
