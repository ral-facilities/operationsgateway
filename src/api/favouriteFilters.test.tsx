import { renderHook, waitFor } from '@testing-library/react';
import { FavouriteFilter } from '../app.types';
import { hooksWrapperWithProviders } from '../testUtils';
import { useAddFavouriteFilter } from './favouriteFilters';

describe('session api functions', () => {
  let mockData: FavouriteFilter;
  beforeEach(() => {
    mockData = {
      name: 'test',
      filter: 'channel 1 < channel 2',
    };
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useAddFavouriteFilter', () => {
    it('posts a request to add a favourite filters for a user and returns successful response', async () => {
      const { result } = renderHook(() => useAddFavouriteFilter(), {
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
      'sends axios request to favourite filters for a user and throws an appropriate error on failure'
    );
  });
});
