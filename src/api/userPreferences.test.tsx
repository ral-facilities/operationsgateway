import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { setMockedPreferredColourMap } from '../mocks/handlers';
import { PREFERRED_COLOUR_MAP_PREFERENCE_NAME } from '../settingsMenuItems.component';
import { hooksWrapperWithProviders } from '../testUtils';
import { useUpdateUserPreference, useUserPreference } from './userPreferences';

describe('user preferences api functions', () => {
  const axiosPost = vi.spyOn(axios, 'post');
  const axiosDelete = vi.spyOn(axios, 'delete');

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

    it.todo(
      'sends axios request to fetch user preference and throws an appropriate error on failure'
    );
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

    it.todo(
      'sends axios request to update user preference and throws an appropriate error on failure'
    );
  });
});
