import { renderHook, waitFor } from '@testing-library/react';
import {
  useDeleteSession,
  useEditSession,
  useSaveSession,
  useSession,
  useSessionList,
} from './sessions';
import { Session, SessionList } from '../app.types';
import { hooksWrapperWithProviders } from '../setupTests';
import sessionsListJSON from '../mocks/sessionsList.json';

describe('session api functions', () => {
  let mockData: Session;
  beforeEach(() => {
    mockData = {
      name: 'test',
      summary: 'test',
      session_data: '{}',
      auto_saved: false,
      _id: '1',
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

      expect(result.current.data).toEqual({ session_id: '1' });
    });

    it.todo(
      'sends axios request to post user session and throws an appropriate error on failure'
    );
  });

  describe('useEditSession', () => {
    it('sends a patch request to edit a user session and returns successful response', async () => {
      const { result } = renderHook(() => useEditSession(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);

      result.current.mutate(mockData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual({ session_id: '1' });
    });

    it.todo(
      'sends axios request to patch user session and throws an appropriate error on failure'
    );
  });

  describe('useDeleteSession', () => {
    it('delete request to delete user session and returns successful response', async () => {
      const { result } = renderHook(() => useDeleteSession(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);

      result.current.mutate(mockData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual('');
    });

    it.todo(
      'sends axios request to delete user session and throws an appropriate error on failure'
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
      const expected: SessionList[] = sessionsListJSON;
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
      const expected: SessionList[] = sessionsListJSON;
      expect(result.current.data).toEqual(expected[0]);
    });

    it.todo(
      'sends axios request to fetch sessions and throws an appropriate error on failure'
    );
  });
});
