import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { hooksWrapperWithProviders } from '../setupTests';
import { useImage } from './images';
// import image from '../mocks/image.png';

describe('images api functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useImage', () => {
    it('sends request to fetch image and returns successful response', async () => {
      const { result } = renderHook(() => useImage('1', 'TEST'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual('testObjectUrl');
    });

    it.todo(
      'sends axios request to fetch image and throws an appropriate error on failure'
    );
  });
});
