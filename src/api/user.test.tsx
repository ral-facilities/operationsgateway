import { renderHook, waitFor } from '@testing-library/react';
import { User } from '../app.types';
import usersJson from '../mocks/users.json';
import { hooksWrapperWithProviders } from '../testUtils';
import { useAddUser, useDeleteUser, useEditUser, useUsers } from './user';

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
    'sends axios request to add a user and throws an appropriate error on failure'
  );
});

describe('useEditUser', () => {
  it('patches a request to edit a user and returns successful response', async () => {
    const { result } = renderHook(() => useEditUser(), {
      wrapper: hooksWrapperWithProviders(),
    });
    expect(result.current.isIdle).toBe(true);

    result.current.mutate({
      _id: 'test',
      updated_password: 'test',
      add_authorised_routes: ['/submit/hdf POST'],
      remove_authorised_routes: ['/submit/manifest POST'],
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(result.current.data).toEqual('test');
  });

  it.todo(
    'sends axios request to edit a user and throws an appropriate error on failure'
  );
});

describe('useDeleteUser', () => {
  it('delete request to delete user and returns successful response', async () => {
    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: hooksWrapperWithProviders(),
    });
    expect(result.current.isIdle).toBe(true);

    result.current.mutate('user1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(result.current.data).toEqual('');
  });

  it.todo(
    'sends axios request to delete user session and throws an appropriate error on failure'
  );
});
