import { renderHook, waitFor } from '@testing-library/react';
import { User } from '../app.types';
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
    const expected: User[] = usersJson;
    expect(result.current.data).toEqual(expected);
  });

  it.todo(
    'sends axios request to fetch users and throws an appropriate error on failure'
  );
});

describe('useAddUser', () => {
  it('posts a request to add a user and returns successful response', async () => {
    const { result } = renderHook(() => useAddUser(), {
      wrapper: hooksWrapperWithProviders(),
    });
    expect(result.current.isIdle).toBe(true);

    result.current.mutate(usersJson[0]);

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(result.current.data).toEqual(usersJson[0]._id);
  });

  it.todo(
    'sends axios request to post user session and throws an appropriate error on failure'
  );
});
