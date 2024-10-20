import { renderHook, waitFor } from '@testing-library/react';
import { ExperimentParams } from '../app.types';
import experimentsJson from '../mocks/experiments.json';
import { hooksWrapperWithProviders } from '../testUtils';
import { useExperiment } from './experiment';

describe('channels api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useExperiment', () => {
    it('sends request to fetch Experiment and returns successful response', async () => {
      const { result } = renderHook(() => useExperiment(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      const expected: ExperimentParams[] = experimentsJson;

      expect(result.current.data).toEqual(expected);
    });

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });
});
