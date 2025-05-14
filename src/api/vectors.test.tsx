import { renderHook, waitFor } from '@testing-library/react';
import { hooksWrapperWithProviders } from '../testUtils';
import { useVector } from './vectors';

describe('vector api functions', () => {
  describe('useVector', () => {
    it('sends request to fetch vector and returns successful response', async () => {
      const { result } = renderHook(() => useVector('1', 'TEST'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual({
        data: [
          5.639372695195284, 5.587336765253104, 1.826101240997037,
          2.521215679028282, -2.980784658113992, -2.279530101757219,
          0.8275213451146765, -0.2507684324157028, -1.3952389582428177,
          -0.925578472683586, 0.5665629489813115, 0.6252987786682547,
          0.16671172514266414, 0.0724989856677573, 0.18313006266485013,
          0.26288446058591775, -0.03412582732888118, 0.1467799869560521,
          0.16014661721357387, 0.10650232684232015,
        ],
      });
    });
  });
});
