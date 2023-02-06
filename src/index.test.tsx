import * as log from 'loglevel';
import { rest } from 'msw';
import { MicroFrontendId } from './app.types';
import { fetchSettings } from './index';
import { server } from './mocks/server';
import { registerRoute } from './state/scigateway.actions';

jest.mock('loglevel');

describe('index - fetchSettings', () => {
  beforeEach(() => {
    global.document.dispatchEvent = jest.fn();
    global.CustomEvent = jest.fn();
  });
  afterEach(() => {
    (log.error as jest.Mock).mockClear();
    (CustomEvent as jest.Mock).mockClear();
    delete process.env.REACT_APP_OPERATIONSGATEWAY_BUILD_DIRECTORY;
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
      rest.get('/operationsgateway-settings.json', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(settingsResult));
      })
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
      rest.get('/operationsgateway-settings.json', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(settingsResult));
      })
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
      rest.get('/operationsgateway-settings.json', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      })
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /operationsgateway-settings.json: apiUrl is undefined in settings'
    );
  });

  it('logs an error if recordLimitWarning is not defined in the settings', async () => {
    server.use(
      rest.get('/operationsgateway-settings.json', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            apiUrl: 'api',
          })
        );
      })
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /operationsgateway-settings.json: recordLimitWarning is undefined in settings'
    );
  });

  it('logs an error if settings.json is an invalid JSON object', async () => {
    server.use(
      rest.get('/operationsgateway-settings.json', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(1));
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
    process.env.REACT_APP_OPERATIONSGATEWAY_BUILD_DIRECTORY =
      '/custom/directory/';
    server.use(
      rest.get(
        `${process.env.REACT_APP_OPERATIONSGATEWAY_BUILD_DIRECTORY}operationsgateway-settings.json`,
        (req, res, ctx) => {
          return res(ctx.status(404));
        }
      )
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /custom/directory/operationsgateway-settings.json: Request failed with status code 404'
    );
  });

  it('logs an error if fails to load a settings.json and is still in a loading state', async () => {
    server.use(
      rest.get('/operationsgateway-settings.json', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const settings = await fetchSettings();

    expect(settings).toBeUndefined();
    expect(log.error).toHaveBeenCalled();

    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Error loading /operationsgateway-settings.json: Request failed with status code 500'
    );
  });

  it('logs an error if no routes are defined in the settings', async () => {
    server.use(
      rest.get('/operationsgateway-settings.json', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            apiUrl: 'api',
            recordLimitWarning: -1,
          })
        );
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
    server.use(
      rest.get('/operationsgateway-settings.json', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            apiUrl: 'api',
            recordLimitWarning: -1,
            routes: [
              {
                section: 'section',
                link: 'link',
              },
            ],
          })
        );
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
