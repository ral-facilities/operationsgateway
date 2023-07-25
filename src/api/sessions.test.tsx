import { renderHook, waitFor } from '@testing-library/react';
import { useSaveSession, useSession, useSessionList } from './sessions';
import { Session, SessionListItem } from '../app.types';
import { hooksWrapperWithProviders } from '../setupTests';
import sessionsListJSON from '../mocks/sessionsList.json';

describe('session api functions', () => {
  let mockData: Session;
  beforeEach(() => {
    mockData = {
      name: 'test',
      summary: 'test',
      session_data: {},
      auto_saved: false,
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useSaveSession', () => {
    it('posts a request to add a user session and returns successful response', async () => {
      const { result } = renderHook(() => useSaveSession(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);

      result.current.mutate(mockData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual('1');
    });

    it.todo(
      'sends axios request to add a user session and throws an appropriate error on failure'
    );
  });

  describe('useSessionList', () => {
    it('sends request to fetch session list and returns successful response', async () => {
      const { result } = renderHook(() => useSessionList(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      const expected: SessionListItem[] = sessionsListJSON;
      expect(result.current.data).toEqual(expected);
    });

    it.todo(
      'sends axios request to fetch sessions and throws an appropriate error on failure'
    );
  });

  describe('useSession', () => {
    it('sends request to fetch session and returns successful response', async () => {
      const { result } = renderHook(() => useSession('1'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      const expected: SessionListItem[] = sessionsListJSON;
      expect(result.current.data).toEqual(expected[0]);
    });

    it.todo(
      'sends axios request to fetch sessions and throws an appropriate error on failure'
    );
  });
});
