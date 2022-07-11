import axios from 'axios';
import { MicroFrontendId } from './app.types';
import { fetchSettings } from './index';
import * as log from 'loglevel';
import { RegisterRouteType } from './state/actions/actions.types';

jest.mock('loglevel');
jest.mock('axios', () => ({
  __esModule: true,
  ...jest.requireActual('axios'),
  get: jest.fn().mockResolvedValue({}),
}));

// TODO test index.tsx (currently struggling to mock axios)
describe.skip('index - fetchSettings', () => {
  beforeEach(() => {
    global.document.dispatchEvent = jest.fn();
    global.CustomEvent = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('settings are loaded', async () => {
    const settingsResult = {
      apiUrl: 'test.api.url',
      routes: [
        {
          section: 'section',
          link: 'link',
          displayName: 'displayName',
        },
      ],
    };

    (axios.get as jest.Mock).mockResolvedValue({ data: settingsResult });

    const settings = await fetchSettings();

    expect(JSON.stringify(settings)).toEqual(JSON.stringify(settingsResult));
    expect(CustomEvent).toHaveBeenCalledTimes(1);
    expect(CustomEvent).toHaveBeenLastCalledWith(MicroFrontendId, {
      detail: {
        type: RegisterRouteType,
        payload: {
          section: 'section',
          link: 'link',
          plugin: 'operationsgateway',
          displayName: 'displayName',
          admin: false,
          hideFromMenu: false,
          order: 0,
          helpSteps: [],
        },
      },
    });
  });

  it('settings loaded and multiple routes registered with any helpSteps provided', async () => {
    const settingsResult = {
      apiUrl: 'test.api.url',
      routes: [
        {
          section: 'section0',
          link: 'link0',
          displayName: 'displayName0',
          order: 0,
        },
        {
          section: 'section1',
          link: 'link1',
          displayName: 'displayName1',
          hideFromMenu: true,
          order: 1,
        },
        {
          section: 'admin0',
          link: 'link0',
          displayName: 'displayNameAdmin0',
          admin: true,
          order: 0,
        },
      ],
      helpSteps: [{ target: '#id', content: 'content' }],
    };

    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: settingsResult,
      })
    );
    const settings = await fetchSettings();

    expect(JSON.stringify(settings)).toEqual(JSON.stringify(settingsResult));
    expect(CustomEvent).toHaveBeenCalledTimes(3);
    expect(CustomEvent).toHaveBeenNthCalledWith(1, MicroFrontendId, {
      detail: {
        type: RegisterRouteType,
        payload: {
          section: 'section0',
          link: 'link0',
          plugin: 'operationsgateway',
          displayName: 'displayName0',
          admin: false,
          hideFromMenu: false,
          order: 0,
          helpSteps: [{ target: '#id', content: 'content' }],
        },
      },
    });
    expect(CustomEvent).toHaveBeenNthCalledWith(2, MicroFrontendId, {
      detail: {
        type: RegisterRouteType,
        payload: {
          section: 'section1',
          link: 'link1',
          plugin: 'operationsgateway',
          displayName: 'displayName1',
          admin: false,
          hideFromMenu: true,
          order: 1,
          helpSteps: [],
        },
      },
    });
    expect(CustomEvent).toHaveBeenNthCalledWith(3, MicroFrontendId, {
      detail: {
        type: RegisterRouteType,
        payload: {
          section: 'admin0',
          link: 'link0',
          plugin: 'operationsgateway',
          displayName: 'displayNameAdmin0',
          admin: true,
          hideFromMenu: false,
          order: 0,
          helpSteps: [],
        },
      },
    });
  });

  it('logs an error if the API URL is not defined in the settings', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {},
      })
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /operationsgateway-settings.json: One of the URL options (idsUrl, apiUrl, downloadApiUrl) is undefined in settings'
    );
  });

  it('logs an error if settings.json is an invalid JSON object', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: 1,
      })
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /operationsgateway-settings.json: Invalid format'
    );
  });

  it('logs an error if settings.json fails to be loaded with custom path', async () => {
    process.env.REACT_APP_DOWNLOAD_BUILD_DIRECTORY = '/custom/directory/';
    (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject({}));

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /custom/directory/operationsgateway-settings.json: undefined'
    );
    delete process.env.REACT_APP_DOWNLOAD_BUILD_DIRECTORY;
  });

  it('logs an error if fails to load a settings.json and is still in a loading state', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject({}));

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /operationsgateway-settings.json: undefined'
    );
  });

  it('logs an error if no routes are defined in the settings', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          apiUrl: 'test.api.url',
        },
      })
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /operationsgateway-settings.json: No routes provided in the settings'
    );
  });

  it('logs an error if route has missing entries', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          apiUrl: 'test.api.url',
          routes: [
            {
              section: 'section',
              link: 'link',
              order: 0,
            },
          ],
        },
      })
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /operationsgateway-settings.json: Route provided does not have all the required entries (section, link, displayName)'
    );
  });
});
