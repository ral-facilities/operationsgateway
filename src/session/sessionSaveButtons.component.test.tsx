import {
  act,
  fireEvent,
  screen,
  waitFor,
  type RenderResult,
} from '@testing-library/react';
import type { MockInstance } from 'vitest';
import { ogApi } from '../api/api';
import { timeChannelName } from '../app.types';
import sessionsJson from '../mocks/sessionsList.json';
import { ImportSessionType } from '../state/store';
import { getInitialState, renderComponentWithProviders } from '../testUtils';
import SessionSaveButtons, {
  AUTO_SAVE_INTERVAL_MS,
  SessionsSaveButtonsProps,
} from './sessionSaveButtons.component';

describe('session buttons', () => {
  let props: SessionsSaveButtonsProps;
  const onSaveAsSessionClick = vi.fn();
  const onChangeAutoSaveSessionId = vi.fn();
  const createView = (): RenderResult => {
    const preloadedState = getInitialState();
    preloadedState.table = {
      ...preloadedState.table,
      selectedColumnIds: ['timestamp'],
    };
    return renderComponentWithProviders(<SessionSaveButtons {...props} />, {
      preloadedState,
    });
  };

  let axiosPostSpy: MockInstance;

  let axiosPatchSpy: MockInstance;

  beforeEach(() => {
    props = {
      onSaveAsSessionClick: onSaveAsSessionClick,
      loadedSessionData: {
        _id: '',
        name: 'test',
        summary: 'test',
        timestamp: '',
        auto_saved: false,
        session: {} as ImportSessionType,
      },
      loadedSessionTimestamp: { timestamp: undefined, autoSaved: undefined },
      onChangeAutoSaveSessionId: onChangeAutoSaveSessionId,
      autoSaveSessionId: undefined,
      sessionsList: sessionsJson,
    };
    vi.useFakeTimers({
      toFake: [
        'Date',
        'setInterval',
        'clearInterval',
        'setTimeout',
        'clearTimeout',
      ],
    }).setSystemTime(new Date('2024-07-15 12:00:00'));

    axiosPostSpy = vi.spyOn(ogApi, 'post');
    axiosPatchSpy = vi.spyOn(ogApi, 'patch');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const { asFragment } = createView();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should be able to create an autosaved session from the current state of session', async () => {
    props = {
      ...props,
      loadedSessionData: {
        _id: '1',
        name: 'test',
        summary: 'test',
        timestamp: '',
        auto_saved: false,
        session: {} as ImportSessionType,
      },
      sessionsList: [
        ...sessionsJson,
        { ...sessionsJson[0], _id: '5', name: 'test' },
      ],
    };

    const queryParams = new URLSearchParams();

    queryParams.append('name', 'test (autosaved)');
    queryParams.append('summary', 'test');
    queryParams.append('auto_saved', 'true');
    const { rerender } = createView();

    act(() => {
      vi.advanceTimersByTime(AUTO_SAVE_INTERVAL_MS);
    });

    await waitFor(() => expect(axiosPostSpy).toHaveBeenCalledTimes(1));
    expect(axiosPostSpy).toHaveBeenCalledWith(
      '/sessions',
      {
        selection: {
          selectedRows: [],
        },
        table: {
          columnStates: {},
          selectedColumnIds: [timeChannelName],
          page: 0,
          resultsPerPage: 25,
          sort: {},
        },
        search: {
          searchParams: {
            dateRange: {
              fromDate: '2024-07-14T12:00:00',
              toDate: '2024-07-15T12:00:59',
            },
            shotnumRange: {},
            maxShots: 50,
            experimentID: null,
          },
        },
        plots: {},
        filter: { appliedFilters: [[]] },
        functions: {
          appliedFunctions: [],
        },
        windows: {},
      },
      {
        params: queryParams,
      }
    );

    props = {
      ...props,
      loadedSessionData: {
        _id: '2',
        name: 'test',
        summary: 'test',
        timestamp: '',
        auto_saved: false,
        session: {} as ImportSessionType,
      },
    };

    rerender(<SessionSaveButtons {...props} />);

    await waitFor(() => expect(axiosPostSpy).toHaveBeenCalledTimes(1));
  });

  it('should update autosave session when autoSavedSessionId exist', async () => {
    props = {
      ...props,
      loadedSessionData: {
        _id: '1',
        name: 'test',
        summary: 'test',
        timestamp: '',
        auto_saved: false,
        session: {} as ImportSessionType,
      },
      autoSaveSessionId: '5',
      sessionsList: [
        ...sessionsJson,
        { ...sessionsJson[0], _id: '5', name: 'test (autosaved)' },
      ],
    };

    const queryParams = new URLSearchParams();

    queryParams.append('name', 'test (autosaved)');
    queryParams.append('summary', 'test');
    queryParams.append('auto_saved', 'true');

    createView();

    act(() => {
      vi.advanceTimersByTime(AUTO_SAVE_INTERVAL_MS);
    });

    await waitFor(() => expect(axiosPatchSpy).toHaveBeenCalledTimes(1));
    expect(axiosPatchSpy).toHaveBeenCalledWith(
      '/sessions/5',
      {
        selection: {
          selectedRows: [],
        },
        table: {
          columnStates: {},
          selectedColumnIds: [timeChannelName],
          page: 0,
          resultsPerPage: 25,
          sort: {},
        },
        search: {
          searchParams: {
            dateRange: {
              fromDate: '2024-07-14T12:00:00',
              toDate: '2024-07-15T12:00:59',
            },
            shotnumRange: {},
            maxShots: 50,
            experimentID: null,
          },
        },
        plots: {},
        filter: { appliedFilters: [[]] },
        functions: {
          appliedFunctions: [],
        },
        windows: {},
      },
      { params: queryParams }
    );
  });

  it('should not enable auto save if an user session is not selected', () => {
    createView();

    act(() => {
      vi.advanceTimersByTime(AUTO_SAVE_INTERVAL_MS);
    });

    expect(axiosPatchSpy).not.toHaveBeenCalledTimes(1);
  });

  it('save a user session', async () => {
    props.loadedSessionData = {
      _id: '1',
      name: 'test',
      summary: 'test',
      session: {} as ImportSessionType,
      auto_saved: false,
      timestamp: '',
    };
    createView();
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeInTheDocument();

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(axiosPatchSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('opens the save dialog when there is not a user session selected', async () => {
    props.loadedSessionData = undefined;
    createView();
    const saveAsButton = screen.getByRole('button', { name: 'Save' });
    expect(saveAsButton).toBeInTheDocument();

    fireEvent.click(saveAsButton);

    await waitFor(() => {
      expect(onSaveAsSessionClick).toHaveBeenCalledTimes(1);
    });
  });
  it('opens the save dialog when save as button is clicked', async () => {
    createView();
    const saveAsButton = screen.getByRole('button', { name: 'Save as' });
    expect(saveAsButton).toBeInTheDocument();

    fireEvent.click(saveAsButton);

    await waitFor(() => {
      expect(onSaveAsSessionClick).toHaveBeenCalledTimes(1);
    });
  });

  it('shows the last time a selected user session was saved', async () => {
    props = {
      ...props,
      loadedSessionTimestamp: {
        timestamp: '2023-06-29T15:45:00',
        autoSaved: false,
      },
    };
    createView();

    const timestamp = screen.getByTestId('session-save-buttons-timestamp');

    expect(timestamp).toHaveTextContent(
      'Session last saved: 29 Jun 2023 15:45'
    );
  });

  it('shows the last time a selected user session was auto saved', async () => {
    props = {
      ...props,
      loadedSessionTimestamp: {
        timestamp: '2023-06-29T15:45:00',
        autoSaved: true,
      },
    };
    createView();

    const element = screen.getByTestId('session-save-buttons-timestamp');

    expect(element).toHaveTextContent(
      'Session last autosaved: 29 Jun 2023 15:45'
    );
  });
});
