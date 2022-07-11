import {
  SettingsLoadedType,
  ConfigurePluginHostSettingType,
} from './actions.types';
import {
  settingsLoaded,
  configureApp,
  loadUrls,
  loadPluginHostSetting,
} from './index';
import { actions, resetActions, dispatch, getState } from '../../setupTests';

jest.mock('loglevel');

const mockSettingsGetter = jest.fn();
jest.mock('../../settings', () => ({
  get settings() {
    return mockSettingsGetter();
  },
}));

describe('Actions', () => {
  afterEach(() => {
    jest.resetAllMocks();
    resetActions();
  });

  it('settingsLoaded returns an action with SettingsLoadedType', () => {
    const action = settingsLoaded();
    expect(action.type).toEqual(SettingsLoadedType);
  });

  it('settings are loaded and loadUrls, loadPluginHostSetting actions are sent', async () => {
    mockSettingsGetter.mockReturnValue({
      apiUrl: 'test.api.url',
      routes: [
        {
          section: 'section',
          link: 'link',
          displayName: 'displayName',
        },
      ],
      pluginHost: 'http://localhost:3000/',
    });

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(actions.length).toEqual(3);
    expect(actions).toContainEqual(loadUrls({ apiUrl: 'test.api.url' }));
    expect(actions).toContainEqual(settingsLoaded());
    expect(actions).toContainEqual(
      loadPluginHostSetting('http://localhost:3000/')
    );
  });

  it('given JSON loadPluginHostSetting returns a ConfigurePluginHostSettingType with ConfigurePluginHostSettingPayload', () => {
    const action = loadPluginHostSetting('http://localhost:3000');
    expect(action.type).toEqual(ConfigurePluginHostSettingType);
    expect(action.payload).toEqual({
      settings: 'http://localhost:3000',
    });
  });

  it("doesn't send any actions when settings are undefined", async () => {
    mockSettingsGetter.mockReturnValue(undefined);
    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(actions.length).toEqual(0);
  });

  it("doesn't send loadPluginHostSetting action when it is not defined", async () => {
    mockSettingsGetter.mockReturnValue({
      apiUrl: 'test.api.url',
    });

    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(actions.length).toEqual(2);
    expect(
      actions.every(({ type }) => type !== ConfigurePluginHostSettingType)
    ).toBe(true);

    expect(actions).toContainEqual(settingsLoaded());
  });
});
