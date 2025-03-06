import { renderHook, waitFor } from '@testing-library/react';
import type { UsersDict } from '../app.types';
import usersJson from '../mocks/users.json';
import { hooksWrapperWithProviders } from '../testUtils';
import { useUsers } from './user';

describe('useUsers', () => {
  it('sends request to fetch users and returns successful response', async () => {
    const { result } = renderHook(() => useUsers(), {
      wrapper: hooksWrapperWithProviders(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });
    const expected: UsersDict = { users: usersJson };
    expect(result.current.data).toEqual(expected);
  });
});
