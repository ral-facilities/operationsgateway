import { renderHook, waitFor } from '@testing-library/react';
import type { UsersDict } from '../app.types';
import usersJson from '../mocks/users.json';
import { hooksWrapperWithProviders } from '../testUtils';
import { useAddUser, useUsers } from './user';

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

describe('useAddUser', () => {
  it('posts a request to add a user and returns successful response', async () => {
    const { result } = renderHook(() => useAddUser(), {
      wrapper: hooksWrapperWithProviders(),
    });
    expect(result.current.isIdle).toBe(true);

    result.current.mutate({
      ...usersJson[0],
      _id: usersJson[0].username,
      sha256_password: 'test',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(result.current.data).toEqual(usersJson[0].username);
  });
});
