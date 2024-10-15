import { renderHook, waitFor } from '@testing-library/react';
import { FavouriteFilterPatch, FavouriteFilterPost } from '../app.types';
import { hooksWrapperWithProviders } from '../testUtils';
import {
  useAddFavouriteFilter,
  useEditFavouriteFilter,
} from './favouriteFilters';

describe('favourite filters api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useAddFavouriteFilter', () => {
    let mockData: FavouriteFilterPost;
    beforeEach(() => {
      mockData = {
        name: 'test',
        filter: 'channel 1 < channel 2',
      };
    });
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
      'sends axios request to add favourite filters for a user and throws an appropriate error on failure'
    );
  });

  describe('useEditFavouriteFilter', () => {
    let mockData: FavouriteFilterPatch;
    beforeEach(() => {
      mockData = {
        name: 'test',
      };
    });
    it('posts a request to edit a favourite filters for a user and returns successful response', async () => {
      const { result } = renderHook(() => useEditFavouriteFilter(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);

      result.current.mutate({ id: '1', favouriteFilter: mockData });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual('Updated 1');
    });

    it.todo(
      'sends axios request to edit favourite filters for a user and throws an appropriate error on failure'
    );
  });
});
