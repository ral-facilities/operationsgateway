import { renderHook, waitFor } from '@testing-library/react';
import { useExperiment } from './experiment';
import { ExperimentParams } from '../app.types';
import { hooksWrapperWithProviders } from '../setupTests';

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

      const expected: ExperimentParams[] = [
        {
          _id: '18325019-4',
          end_date: '2020-01-06T18:00:00',
          experiment_id: '18325019',
          part: 4,
          start_date: '2020-01-03T10:00:00',
        },
        {
          _id: '18325019-5',
          end_date: '2019-06-12T17:00:00',
          experiment_id: '18325019',
          part: 5,
          start_date: '2019-06-12T09:00:00',
        },
        {
          _id: '18325024-1',
          end_date: '2019-03-13T18:00:00',
          experiment_id: '18325024',
          part: 1,
          start_date: '2019-03-13T10:00:00',
        },
        {
          _id: '18325025-1',
          end_date: '2019-12-01T18:00:00',
          experiment_id: '18325025',
          part: 1,
          start_date: '2019-12-01T10:00:00',
        },
        {
          _id: '19510000-1',
          end_date: '2019-10-01T17:00:00',
          experiment_id: '19510000',
          part: 1,
          start_date: '2019-10-01T09:00:00',
        },
      ];

      expect(result.current.data).toEqual(expected);
    });

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });
});
