import { AxiosError } from 'axios';
import log from 'loglevel';
import { UnknownAction } from 'redux';
import handleOG_APIError from './handleOG_APIError';
import { NotificationType } from './state/scigateway.actions';

vi.mock('loglevel');

describe('handleOG_APIError', () => {
  let error: AxiosError;
  let events: CustomEvent<UnknownAction>[] = [];

  beforeEach(() => {
    events = [];

    document.dispatchEvent = (e: Event) => {
      events.push(e as CustomEvent<UnknownAction>);
      return true;
    };

    error = {
      isAxiosError: true,
      response: {
        data: { detail: 'Test error message (response data)' },
        status: 404,
        statusText: 'Not found',
        headers: {},
        // @ts-expect-error: not needed for test
        config: {},
      },
      name: 'Test error name',
      message: 'Test error message',
      toJSON: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('logs an error and sends a notification to SciGateway', () => {
    handleOG_APIError(error);

    expect(log.error).toHaveBeenCalledWith(
      'Test error message (response data)'
    );
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'error',
        message: 'Test error message (response data)',
      },
    });
  });

  it('does not broadcast 403 errors', () => {
    error = {
      isAxiosError: true,
      response: {
        data: {},
        status: 403,
        statusText: 'Invalid token or expired token',
        headers: {},
        // @ts-expect-error: not needed for test
        config: {},
      },
      name: 'Test error name',
      message: 'Test error message',
      toJSON: vi.fn(),
    };

    handleOG_APIError(error);

    expect(log.error).toHaveBeenCalledWith('Test error message');
    expect(events.length).toBe(0);
  });

  it('logs fallback error.message if there is no response message', () => {
    error = {
      isAxiosError: true,
      response: {
        data: {},
        status: 418,
        statusText: 'Internal Server Error',
        headers: {},
        // @ts-expect-error: not needed for test
        config: {},
      },
      name: 'Test error name',
      message: 'Test error message',
      toJSON: vi.fn(),
    };

    handleOG_APIError(error);

    expect(log.error).toHaveBeenCalledWith('Test error message');
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'error',
        message: 'Test error message',
      },
    });
  });

  it('logs generic message if the error is a 500', () => {
    error = {
      isAxiosError: true,
      response: {
        data: {},
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        // @ts-expect-error: not needed for test
        config: {},
      },
      name: 'Test error name',
      message: 'Test error message',
      toJSON: vi.fn(),
    };

    handleOG_APIError(error);

    expect(log.error).toHaveBeenCalledWith('Test error message');
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'error',
        message:
          'Something went wrong, please contact the system administrator',
      },
    });
  });

  it('logs network error message if there is no response', () => {
    error = {
      isAxiosError: true,
      name: 'Test error name',
      message: 'Network Error',
      toJSON: vi.fn(),
    };

    handleOG_APIError(error);

    expect(log.error).toHaveBeenCalledWith('Network Error');
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'error',
        message: 'Network Error, please reload the page or try again later',
      },
    });
  });

  it('just logs an error if broadcast is false', () => {
    handleOG_APIError(error, false);

    expect(log.error).toHaveBeenCalledWith(
      'Test error message (response data)'
    );
    expect(events.length).toBe(0);
  });
});
