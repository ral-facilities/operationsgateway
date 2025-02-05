import { renderHook, waitFor } from '@testing-library/react';
import { Session, SessionListItem, SessionResponse } from '../app.types';
import sessionsListJSON from '../mocks/sessionsList.json';
import { ImportSessionType } from '../state/store';
import { hooksWrapperWithProviders } from '../testUtils';
import {
  useDeleteSession,
  useEditSession,
  useSaveSession,
  useSession,
  useSessionList,
} from './sessions';

describe('session api functions', () => {
  let mockSessionData: Session;
  let mockSessionResponseData: SessionResponse;

  beforeEach(() => {
    mockSessionData = {
      name: 'test',
      summary: 'test',
      session: {} as ImportSessionType,
      auto_saved: false,
    };
    mockSessionResponseData = {
      _id: '1',
      name: 'test',
      summary: 'test',
      timestamp: '2024-08-16T16:30:52',
      auto_saved: false,
      session: {} as ImportSessionType,
    };
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useSaveSession', () => {
    it('posts a request to add a user session and returns successful response', async () => {
      const { result } = renderHook(() => useSaveSession(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);

      result.current.mutate(mockSessionData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual('1');
    });
  });

  describe('useEditSession', () => {
    it('sends a patch request to edit a user session and returns successful response', async () => {
      const { result } = renderHook(() => useEditSession(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);

      result.current.mutate(mockSessionResponseData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual('1');
    });
  });

  describe('useDeleteSession', () => {
    it('delete request to delete user session and returns successful response', async () => {
      const { result } = renderHook(() => useDeleteSession(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);

      result.current.mutate(mockSessionResponseData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual('');
    });
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

    it('does not send request to fetch session when session is undefined', async () => {
      const { result } = renderHook(() => useSession(undefined), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.data).toEqual(undefined);
      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });
  });
});
