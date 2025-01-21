import { renderHook, waitFor } from '@testing-library/react';
import { PREFERRED_COLOUR_MAP_PREFERENCE_NAME } from '../app.types';
import { setMockedPreferredColourMap } from '../mocks/handlers';
import { hooksWrapperWithProviders } from '../testUtils';
import { ogApi } from './api';
import { useUpdateUserPreference, useUserPreference } from './userPreferences';

describe('user preferences api functions', () => {
  const axiosPost = vi.spyOn(ogApi, 'post');
  const axiosDelete = vi.spyOn(ogApi, 'delete');

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useUserPreference', () => {
    it('sends request to fetch user preferences and returns successful response', async () => {
      // ensure we have a static colourmap
      setMockedPreferredColourMap('cividis');

      const { result } = renderHook(
        () => useUserPreference(PREFERRED_COLOUR_MAP_PREFERENCE_NAME),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual('cividis');
    });

    it('sends request to fetch user preferences and returns successful response when user preference is not set', async () => {
      setMockedPreferredColourMap(undefined);

      const { result } = renderHook(
        () => useUserPreference(PREFERRED_COLOUR_MAP_PREFERENCE_NAME),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual(null);
    });
  });

  describe('useUpdateUserPreference', () => {
    it('sends a post request to change a user preference and returns successful response', async () => {
      const { result } = renderHook(
        () => useUpdateUserPreference(PREFERRED_COLOUR_MAP_PREFERENCE_NAME),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );
      expect(result.current.isIdle).toBe(true);

      result.current.mutate({ value: 'test' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual('test');
      expect(axiosPost).toHaveBeenCalled();
    });

    it('sends a delete request to change a user preference when value is null and returns successful response', async () => {
      const { result } = renderHook(
        () => useUpdateUserPreference(PREFERRED_COLOUR_MAP_PREFERENCE_NAME),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );
      expect(result.current.isIdle).toBe(true);

      result.current.mutate({ value: null });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual('');
      expect(axiosDelete).toHaveBeenCalled();
    });
  });
});
