import { renderHook, waitFor } from '@testing-library/react';
import { User } from '../app.types';
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
    const expected: User[] = usersJson;
    expect(result.current.data).toEqual(expected);
  });

  it.todo(
    'sends axios request to fetch users and throws an appropriate error on failure'
  );
});
