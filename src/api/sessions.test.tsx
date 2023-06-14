import { renderHook, waitFor } from '@testing-library/react';
import { useSaveSession } from './sessions';
import { Session } from '../app.types';
import { hooksWrapperWithProviders } from '../setupTests';

describe('session api functions', () => {
  let mockData: Session;
  beforeEach(() => {
    mockData = {
      name: 'test',
      summary: 'test',
      session_data: '{}',
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
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });
});
