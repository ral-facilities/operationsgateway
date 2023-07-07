import { renderHook, waitFor } from '@testing-library/react';
import { useExperiment } from './experiment';
import { ExperimentParams } from '../app.types';
import { hooksWrapperWithProviders } from '../setupTests';
import experimentsJson from '../mocks/experiments.json';

describe('channels api functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
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
