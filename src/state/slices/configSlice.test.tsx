import { staticChannels } from '../../api/channels';
import { setSettings } from '../../settings';
import { actions, dispatch, resetActions } from '../../testUtils';
import ConfigReducer, {
  configureApp,
  defaultMaxShotOptions,
  initialState,
  loadDataTypesSetting,
  loadInitialChannelsSetting,
  loadMaxShotsSetting,
  loadPlotAxisSigFigsSetting,
  loadPluginHostSetting,
  loadRecordLimitWarningSetting,
  loadRoundingConfigSetting,
  loadUrls,
  loadWorkingHoursSetting,
  settingsLoaded,
} from './configSlice';

vi.mock('loglevel');

describe('configSlice', () => {
  const originalActiveArea = staticChannels['active_area'];
  const originalShotNum = staticChannels['shotnum'];

  beforeEach(() => {
    staticChannels['active_area'] = JSON.parse(
      JSON.stringify(originalActiveArea)
    );
    staticChannels['shotnum'] = JSON.parse(JSON.stringify(originalShotNum));
  });

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

    it('should set maxShots property when loadMaxShotsSetting action is sent', () => {
      expect(state.maxShots).toEqual(defaultMaxShotOptions);

      const updatedState = ConfigReducer(
        state,
        loadMaxShotsSetting([
          { value: 100, default: true },
          { value: 'Unlimited' },
        ])
      );

      expect(updatedState.maxShots).toEqual([
        { value: 100, default: true },
        { value: 'Unlimited' },
      ]);
    });

    it('should set workingHours property when loadWorkingHoursSetting action is sent', () => {
      expect(state.workingHours).toEqual({ start: 9, end: 18 });

      const updatedState = ConfigReducer(
        state,
        loadWorkingHoursSetting({ start: 10, end: 17 })
      );

      expect(updatedState.workingHours).toEqual({ start: 10, end: 17 });
    });

    it('should set plotAxisSigFigs property when loadPlotAxisSigFigsSetting action is sent', () => {
      expect(state.plotAxisSigFigs).toEqual(undefined);

      const updatedState = ConfigReducer(
        state,
        loadPlotAxisSigFigsSetting('.3~s')
      );

      expect(updatedState.plotAxisSigFigs).toEqual('.3~s');
    });

    it('should set dataTypes property when loadDataTypesSetting action is sent', () => {
      expect(state.dataTypes).toEqual(undefined);

      const updatedState = ConfigReducer(
        state,
        loadDataTypesSetting(['GS', 'GD'])
      );

      expect(updatedState.dataTypes).toEqual(['GS', 'GD']);
    });

    it('should set rounding config property when loadRoundingConfig action is sent', () => {
      expect(state.roundingConfig).toEqual({
        source: 'column_definitions',
        precisionMeaning: 'EPAC',
      });

      const updatedState = ConfigReducer(
        state,
        loadRoundingConfigSetting({
          source: 'value',
          precisionMeaning: 'decimal_places',
          precision: 3,
          trimTrailingZeros: true,
          scientificNotationThresholds: {
            large: {
              upper: 1e6,
              lower: -1e6,
            },
            small: { upper: 1e-3, lower: -1e-3 },
          },
        })
      );

      expect(updatedState.roundingConfig).toEqual({
        source: 'value',
        precisionMeaning: 'decimal_places',
        precision: 3,
        trimTrailingZeros: true,
        scientificNotationThresholds: {
          large: {
            upper: 1e6,
            lower: -1e6,
          },
          small: { upper: 1e-3, lower: -1e-3 },
        },
      });
    });
  });

  describe('Actions', () => {
    afterEach(() => {
      resetActions();
    });

    it('settings are loaded and loadUrls, loadRecordLimitWarningSetting, loadInitialChannelsSetting, loadPluginHost, loadWorkingHoursSetting, loadRoundingConfigSetting and settingsLoaded actions are sent and data types are configured', async () => {
      setSettings(
        Promise.resolve({
          apiUrl: 'api',
          recordLimitWarning: -1,
          maxShots: [{ value: 100, default: true }, { value: 'Unlimited' }],
          initialChannels: {
            timestamp: { removable: false, sticky: true },
            shotnum: { removable: true, sticky: false },
          },
          routes: [
            {
              section: 'section',
              link: 'link',
              displayName: 'displayName',
              order: 1,
            },
          ],
          pluginHost: 'http://localhost:3000/',
          workingHours: { start: 10, end: 17 },
          plotAxisSigFigs: '.2~s',
          dataTypes: ['GS', 'GD'],
          roundingConfig: {
            source: 'value',
            precisionMeaning: 'decimal_places',
            precision: 3,
            trimTrailingZeros: true,
            scientificNotationThresholds: {
              large: {
                upper: 1e6,
                lower: -1e6,
              },
              small: { upper: 1e-3, lower: -1e-3 },
            },
          },
        })
      );
      const asyncAction = configureApp();
      await asyncAction(dispatch);

      expect(actions.length).toEqual(10);
      expect(actions).toContainEqual(
        loadUrls({
          apiUrl: 'api',
        })
      );
      expect(actions).toContainEqual(loadRecordLimitWarningSetting(-1));
      expect(actions).toContainEqual(
        loadMaxShotsSetting([
          { value: 100, default: true },
          { value: 'Unlimited' },
        ])
      );
      expect(actions).toContainEqual(
        loadInitialChannelsSetting({
          timestamp: { removable: false, sticky: true },
          shotnum: { removable: true, sticky: false },
        })
      );
      expect(actions).toContainEqual(
        loadPluginHostSetting('http://localhost:3000/')
      );
      expect(actions).toContainEqual(
        loadWorkingHoursSetting({ start: 10, end: 17 })
      );
      expect(actions).toContainEqual(loadPlotAxisSigFigsSetting('.2~s'));
      expect(actions).toContainEqual(loadDataTypesSetting(['GS', 'GD']));
      expect(staticChannels['active_area'].name).toBe('Data Type');
      expect(staticChannels['shotnum'].type).toBe('string');
      expect(actions).toContainEqual(
        loadRoundingConfigSetting({
          source: 'value',
          precisionMeaning: 'decimal_places',
          precision: 3,
          trimTrailingZeros: true,
          scientificNotationThresholds: {
            large: {
              upper: 1e6,
              lower: -1e6,
            },
            small: { upper: 1e-3, lower: -1e-3 },
          },
        })
      );

      expect(actions).toContainEqual(settingsLoaded());
    });

    it("doesn't send loadPluginHostSetting, loadPlotAxisSigFigsSetting and loadWorkingHoursSetting actions or configure data types when they're not defined", async () => {
      setSettings(
        Promise.resolve({
          apiUrl: 'api',
          recordLimitWarning: -1,
          maxShots: defaultMaxShotOptions,
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

      expect(actions.length).toEqual(5);
      expect(
        actions.every(({ type }) => type !== loadPluginHostSetting.type)
      ).toBe(true);

      expect(
        actions.every(({ type }) => type !== loadWorkingHoursSetting.type)
      ).toBe(true);
      expect(
        actions.every(({ type }) => type !== loadPlotAxisSigFigsSetting.type)
      ).toBe(true);
      expect(
        actions.every(({ type }) => type !== loadDataTypesSetting.type)
      ).toBe(true);
      expect(
        actions.every(({ type }) => type !== loadRoundingConfigSetting.type)
      ).toBe(true);
      expect(staticChannels['active_area'].name).toBe('Active Area');
      // ensure even if we don't define initial channel settings we initialise with the default
      expect(actions).toContainEqual(
        loadInitialChannelsSetting({
          timestamp: { removable: false, sticky: true },
        })
      );

      expect(actions).toContainEqual(settingsLoaded());
    });

    it("doesn't configure data types when it is an empty array", async () => {
      setSettings(
        Promise.resolve({
          apiUrl: 'api',
          recordLimitWarning: -1,
          maxShots: defaultMaxShotOptions,
          routes: [
            {
              section: 'section',
              link: 'link',
              displayName: 'displayName',
              order: 1,
            },
          ],
          dataTypes: [],
        })
      );

      const asyncAction = configureApp();
      await asyncAction(dispatch);

      expect(
        actions.every(({ type }) => type !== loadDataTypesSetting.type)
      ).toBe(true);
      expect(staticChannels['active_area'].name).toBe('Active Area');

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
