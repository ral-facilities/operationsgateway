import log from 'loglevel';
import { http, HttpResponse } from 'msw';
import { MicroFrontendId } from './app.types';
import { fetchSettings } from './main';
import { server } from './mocks/server';
import { registerRoute } from './state/scigateway.actions';

vi.mock('loglevel');
vi.mock('hacktimer', () => ({}));

describe('index - fetchSettings', () => {
  beforeEach(() => {
    global.document.dispatchEvent = vi.fn();
    global.CustomEvent = vi.fn();
    // Pretend in SciGateway to prevent attempting to render (which throws an error as the index.html is not loaded
    // for render to work)
    document.getElementById = vi
      .fn()
      .mockReturnValue(document.createElement('div'));
  });
  afterEach(() => {
    vi.mocked(log.error).mockClear();
    vi.mocked(CustomEvent).mockClear();
    delete import.meta.env.VITE_APP_OPERATIONS_GATEWAY_BUILD_DIRECTORY;
  });

  it('settings are loaded', async () => {
    const settingsResult = {
      apiUrl: 'api',
      recordLimitWarning: -1,
      routes: [
        {
          section: 'section',
          link: 'link',
          displayName: 'displayName',
        },
      ],
      pluginHost: 'http://localhost:3000/',
    };

    server.use(
      http.get('/operationsgateway-settings.json', () =>
        HttpResponse.json(settingsResult, { status: 200 })
      )
    );

    const settings = await fetchSettings();

    expect(JSON.stringify(settings)).toEqual(JSON.stringify(settingsResult));
    expect(CustomEvent).toHaveBeenCalledTimes(1);
    expect(CustomEvent).toHaveBeenLastCalledWith(MicroFrontendId, {
      detail: {
        type: registerRoute.type,
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
      apiUrl: 'api',
      recordLimitWarning: -1,
      routes: [
        {
          section: 'section0',
          link: 'link0',
          displayName: 'displayName0',
          order: 0,
          admin: true,
        },
        {
          section: 'section1',
          link: 'link1',
          displayName: 'displayName1',
          order: 1,
          hideFromMenu: true,
        },
      ],
      helpSteps: [{ target: '#id', content: 'content' }],
    };

    server.use(
      http.get('/operationsgateway-settings.json', () =>
        HttpResponse.json(settingsResult, { status: 200 })
      )
    );
    const settings = await fetchSettings();

    expect(JSON.stringify(settings)).toEqual(JSON.stringify(settingsResult));
    expect(CustomEvent).toHaveBeenCalledTimes(2);
    expect(CustomEvent).toHaveBeenNthCalledWith(1, MicroFrontendId, {
      detail: {
        type: registerRoute.type,
        payload: {
          section: 'section0',
          link: 'link0',
          plugin: 'operationsgateway',
          displayName: 'displayName0',
          admin: true,
          hideFromMenu: false,
          order: 0,
          helpSteps: [{ target: '#id', content: 'content' }],
        },
      },
    });
    expect(CustomEvent).toHaveBeenNthCalledWith(2, MicroFrontendId, {
      detail: {
        type: registerRoute.type,
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
  });

  it('logs an error if API URLs is not defined in the settings', async () => {
    server.use(
      http.get('/operationsgateway-settings.json', () =>
        HttpResponse.json({}, { status: 200 })
      )
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = vi.mocked(log.error).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /operationsgateway-settings.json: apiUrl is undefined in settings'
    );
  });

  it('logs an error if recordLimitWarning is not defined in the settings', async () => {
    server.use(
      http.get('/operationsgateway-settings.json', () =>
        HttpResponse.json(
          {
            apiUrl: 'api',
          },
          { status: 200 }
        )
      )
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = vi.mocked(log.error).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /operationsgateway-settings.json: recordLimitWarning is undefined in settings'
    );
  });

  it('logs an error if settings.json is an invalid JSON object', async () => {
    server.use(
      http.get('/operationsgateway-settings.json', () =>
        HttpResponse.json(1, { status: 200 })
      )
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = vi.mocked(log.error).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /operationsgateway-settings.json: Invalid format'
    );
  });

  it('logs an error if settings.json fails to be loaded with custom path', async () => {
    import.meta.env.VITE_APP_OPERATIONS_GATEWAY_BUILD_DIRECTORY =
      '/custom/directory/';
    server.use(
      http.get(
        `${
          import.meta.env.VITE_APP_OPERATIONS_GATEWAY_BUILD_DIRECTORY
        }operationsgateway-settings.json`,
        () => new HttpResponse(null, { status: 404 })
      )
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = vi.mocked(log.error).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /custom/directory/operationsgateway-settings.json: Request failed with status code 404'
    );
  });

  it('logs an error if fails to load a settings.json and is still in a loading state', async () => {
    server.use(
      http.get(
        '/operationsgateway-settings.json',
        () => new HttpResponse(null, { status: 500 })
      )
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = vi.mocked(log.error).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /operationsgateway-settings.json: Request failed with status code 500'
    );
  });

  it('logs an error if no routes are defined in the settings', async () => {
    server.use(
      http.get('/operationsgateway-settings.json', () =>
        HttpResponse.json(
          {
            apiUrl: 'api',
            recordLimitWarning: -1,
          },
          { status: 200 }
        )
      )
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = vi.mocked(log.error).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /operationsgateway-settings.json: No routes provided in the settings'
    );
  });

  it('logs an error if route has missing entries', async () => {
    server.use(
      http.get('/operationsgateway-settings.json', () =>
        HttpResponse.json(
          {
            apiUrl: 'api',
            recordLimitWarning: -1,
            routes: [
              {
                section: 'section',
                link: 'link',
              },
            ],
          },
          { status: 200 }
        )
      )
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = vi.mocked(log.error).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /operationsgateway-settings.json: Route provided does not have all the required entries (section, link, displayName)'
    );
  });
});
