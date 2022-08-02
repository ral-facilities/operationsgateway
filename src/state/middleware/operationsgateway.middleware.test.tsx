import OperationsGatewayMiddleware, {
  listenToMessages,
} from './operationsgateway.middleware';
import log from 'loglevel';
import {
  requestPluginRerender,
  registerRoute,
  broadcastSignOut,
  sendThemeOptions,
} from '../scigateway.actions';
import { AnyAction } from '@reduxjs/toolkit';

// this sets up the mock store and returns some things to test
const create = () => {
  const store = {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn(),
  };
  const next = jest.fn();

  const invoke = (action) => OperationsGatewayMiddleware(store)(next)(action);

  return { store, next, invoke };
};

describe('OperationsGateway Middleware', () => {
  let events: CustomEvent<AnyAction>[];
  let handler: (event: Event) => void;

  const action = {
    type: 'operationsgateway:api:test-action',
    payload: {
      broadcast: true,
    },
  };

  let next;
  let invoke;
  let store;

  beforeEach(() => {
    events = [];
    handler = () => {};

    document.dispatchEvent = (e: Event) => {
      events.push(e as CustomEvent<AnyAction>);
      return true;
    };

    document.addEventListener = jest.fn(
      (id: string, inputHandler: (event: Event) => void) => {
        handler = inputHandler;
      }
    );

    ({ next, invoke, store } = create());
  });

  describe('OperationsGatewayMiddleware', () => {
    it('should broadcast messages with broadcast flag', () => {
      invoke(action);

      expect(events.length).toEqual(1);
      expect(events[0].detail).toEqual(action);
      expect(next).toHaveBeenCalledWith(action);
    });

    it('should not broadcast messages without broadcast flag', () => {
      invoke({
        type: 'test',
        payload: {},
      });

      expect(events.length).toEqual(0);
      expect(next).toHaveBeenCalledWith({
        type: 'test',
        payload: {},
      });
    });

    it('should not broadcast messages without payload', () => {
      invoke({ type: 'test' });

      expect(events.length).toEqual(0);
      expect(next).toHaveBeenCalledWith({
        type: 'test',
      });
    });
  });

  describe('listenToMessages', () => {
    it('should handle plugin_rerender action and ignore it (it is handled in index.tsx)', () => {
      listenToMessages(store.dispatch);

      handler(
        new CustomEvent('test', {
          detail: { type: requestPluginRerender.type },
        })
      );

      expect(document.addEventListener).toHaveBeenCalled();
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should handle register_route action and ignore it', () => {
      listenToMessages(store.dispatch);

      handler(
        new CustomEvent('test', { detail: { type: registerRoute.type } })
      );

      expect(document.addEventListener).toHaveBeenCalled();
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should handle send theme options action and ignore it', () => {
      listenToMessages(store.dispatch);

      handler(
        new CustomEvent('test', { detail: { type: sendThemeOptions.type } })
      );

      expect(document.addEventListener).toHaveBeenCalled();
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should handle broadcast signout action and ignore it', () => {
      listenToMessages(store.dispatch);

      handler(
        new CustomEvent('test', { detail: { type: broadcastSignOut.type } })
      );

      expect(document.addEventListener).toHaveBeenCalled();
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should listen for events and not fire unrecognised action', () => {
      log.warn = jest.fn();
      listenToMessages(store.dispatch);

      handler(new CustomEvent('test', { detail: action }));

      expect(document.addEventListener).toHaveBeenCalled();
      expect(store.dispatch).not.toHaveBeenCalled();

      expect(log.warn).toHaveBeenCalled();
      const mockLog = (log.warn as jest.Mock).mock;
      expect(mockLog.calls[0][0]).toContain(
        'Unexpected message received, not dispatched'
      );
    });

    it('should not fire actions for events without detail', () => {
      log.error = jest.fn();

      listenToMessages(store.dispatch);

      handler(new CustomEvent('test', { detail: undefined }));

      expect(document.addEventListener).toHaveBeenCalled();
      expect(store.dispatch).not.toHaveBeenCalled();

      expect(log.error).toHaveBeenCalled();
      const mockLog = (log.error as jest.Mock).mock;
      expect(mockLog.calls[0][0]).toEqual(
        'Invalid message received:\nevent.detail = null'
      );
    });

    it('should not fire actions for events without type on detail', () => {
      log.error = jest.fn();

      listenToMessages(store.dispatch);

      handler(new CustomEvent('test', { detail: { actionWithoutType: true } }));

      expect(document.addEventListener).toHaveBeenCalled();
      expect(store.dispatch).not.toHaveBeenCalled();

      expect(log.error).toHaveBeenCalled();
      const mockLog = (log.error as jest.Mock).mock;
      expect(mockLog.calls[0][0]).toEqual(
        'Invalid message received:\nevent.detail = {"actionWithoutType":true}'
      );
    });
  });
});
