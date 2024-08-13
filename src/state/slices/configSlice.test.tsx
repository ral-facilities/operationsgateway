import { setSettings } from '../../settings';
import { actions, dispatch, resetActions } from '../../testUtils';
import ConfigReducer, {
  configureApp,
  initialState,
  loadPluginHostSetting,
  loadRecordLimitWarningSetting,
  loadUrls,
  settingsLoaded,
} from './configSlice';

jest.mock('loglevel');

describe('configSlice', () => {
  // normally can test reducers in components, but since configSlice is high level
  // we'll create standalone unit tests for it
  describe('Reducer', () => {
    let state: typeof initialState;

    beforeEach(() => {
      state = initialState;
    });

    it('should return state for actions if does not care about', () => {
      const updatedState = ConfigReducer(state, {
        type: 'irrelevant action',
      });

      expect(updatedState).toBe(state);
    });

    it('should set settingsLoaded to true when settingsLoaded action is sent', () => {
      expect(state.settingsLoaded).toBe(false);

      const updatedState = ConfigReducer(state, settingsLoaded());
      expect(updatedState.settingsLoaded).toBe(true);
    });

    it('should set pluginHostSetting when configuring action is sent', () => {
      expect(state.pluginHost).toEqual('');

      const updatedState = ConfigReducer(
        state,
        loadPluginHostSetting('http://localhost:3000')
      );

      expect(updatedState.pluginHost).toEqual('http://localhost:3000');
    });

    it('should set urls property when configure urls action is sent', () => {
      expect(state.urls.apiUrl).toEqual('');

      const updatedState = ConfigReducer(
        state,
        loadUrls({
          ...state.urls,
          apiUrl: 'test.api.url',
        })
      );

      expect(updatedState.urls.apiUrl).toEqual('test.api.url');
    });

    it('should set recordLimitWarning property when loadRecordLimitWarningSetting action is sent', () => {
      expect(state.recordLimitWarning).toEqual(-1);

      const updatedState = ConfigReducer(
        state,
        loadRecordLimitWarningSetting(10)
      );

      expect(updatedState.recordLimitWarning).toEqual(10);
    });
  });

  describe('Actions', () => {
    afterEach(() => {
      resetActions();
    });

    it('settings are loaded and loadUrls, loadRecordLimitWarningSetting, loadPluginHost and settingsLoaded actions are sent', async () => {
      setSettings(
        Promise.resolve({
          apiUrl: 'api',
          recordLimitWarning: -1,
          routes: [
            {
              section: 'section',
              link: 'link',
              displayName: 'displayName',
              order: 1,
            },
          ],
          pluginHost: 'http://localhost:3000/',
        })
      );
      const asyncAction = configureApp();
      await asyncAction(dispatch);

      expect(actions.length).toEqual(4);
      expect(actions).toContainEqual(
        loadUrls({
          apiUrl: 'api',
        })
      );
      expect(actions).toContainEqual(loadRecordLimitWarningSetting(-1));
      expect(actions).toContainEqual(
        loadPluginHostSetting('http://localhost:3000/')
      );
      expect(actions).toContainEqual(settingsLoaded());
    });

    it("doesn't send loadPluginHostSetting actions when they're not defined", async () => {
      setSettings(
        Promise.resolve({
          apiUrl: 'api',
          recordLimitWarning: -1,
          routes: [
            {
              section: 'section',
              link: 'link',
              displayName: 'displayName',
              order: 1,
            },
          ],
        })
      );

      const asyncAction = configureApp();
      await asyncAction(dispatch);

      expect(actions.length).toEqual(3);
      expect(
        actions.every(({ type }) => type !== loadPluginHostSetting.type)
      ).toBe(true);

      expect(actions).toContainEqual(settingsLoaded());
    });

    it("doesn't send any actions when settings are undefined", async () => {
      setSettings(Promise.resolve(undefined));
      const asyncAction = configureApp();
      await asyncAction(dispatch);

      expect(actions.length).toEqual(0);
    });
  });
});
