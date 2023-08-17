import React from 'react';
import {
  type RenderResult,
  act,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import SessionSaveButtons, {
  SessionsSaveButtonsProps,
  AUTO_SAVE_INTERVAL_MS,
} from './sessionSaveButtons.component';
import { renderComponentWithProviders } from '../setupTests';
import { useEditSession, useSaveSession } from '../api/sessions';

// Mock the useEditSession hook
jest.mock('../api/sessions', () => ({
  useEditSession: jest.fn(),
  useSaveSession: jest.fn(),
}));

describe('session buttons', () => {
  let props: SessionsSaveButtonsProps;
  const onSaveAsSessionClick = jest.fn();
  const onChangeAutoSaveSessionId = jest.fn();
  const createView = (): RenderResult => {
    return renderComponentWithProviders(<SessionSaveButtons {...props} />);
  };

  beforeEach(() => {
    props = {
      onSaveAsSessionClick: onSaveAsSessionClick,
      loadedSessionData: {
        _id: '',
        auto_saved: false,
        name: 'test',
        summary: 'test',
        session: {},
        timestamp: '',
      },
      loadedSessionTimestamp: { timestamp: undefined, autoSaved: undefined },
      onChangeAutoSaveSessionId: onChangeAutoSaveSessionId,
      autoSaveSessionId: undefined,
    };
    jest.useFakeTimers();

    // Mock the return value of useEditSession hook
    useEditSession.mockReturnValue({
      mutate: jest.fn().mockResolvedValue({}),
    });
    useSaveSession.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { asFragment } = createView();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should be able to create an autosaved session from the current state of session', () => {
    props = {
      ...props,
      loadedSessionData: {
        name: 'test',
        summary: 'test',
        auto_saved: false,
        session: {},
        _id: '1',
        timestamp: '',
      },
    };
    const { rerender } = createView();

    act(() => {
      jest.advanceTimersByTime(AUTO_SAVE_INTERVAL_MS);
    });

    expect(useSaveSession().mutateAsync).toHaveBeenCalledTimes(1);
    expect(useSaveSession().mutateAsync).toHaveBeenCalledWith({
      auto_saved: true,
      name: 'test (autosaved)',
      summary: 'test',
      session: {
        table: {
          columnStates: {},
          selectedColumnIds: [],
          page: 0,
          resultsPerPage: 25,
          sort: {},
        },
        search: {
          searchParams: {
            dateRange: {},
            shotnumRange: {},
            maxShots: 50,
            experimentID: null,
          },
        },
        plots: {},
        filter: { appliedFilters: [[]] },
        windows: {},
      },
    });

    props = {
      ...props,
      loadedSessionData: {
        name: 'test',
        summary: 'test',
        auto_saved: false,
        session: {},
        _id: '2',
        timestamp: '',
      },
    };

    rerender(<SessionSaveButtons {...props} />);

    expect(useSaveSession().mutateAsync).toHaveBeenCalledTimes(1);
    expect(useSaveSession().mutateAsync).toHaveBeenCalledWith({
      auto_saved: true,
      name: 'test (autosaved)',
      summary: 'test',
      session: {
        table: {
          columnStates: {},
          selectedColumnIds: [],
          page: 0,
          resultsPerPage: 25,
          sort: {},
        },
        search: {
          searchParams: {
            dateRange: {},
            shotnumRange: {},
            maxShots: 50,
            experimentID: null,
          },
        },
        plots: {},
        filter: { appliedFilters: [[]] },
        windows: {},
      },
    });
  });

  it('should update autosave session when autoSavedSessionId exist', () => {
    props = {
      ...props,
      loadedSessionData: {
        name: 'test',
        summary: 'test',
        auto_saved: false,
        session: {},
        _id: '1',
        timestamp: '',
      },
      autoSaveSessionId: '5',
    };
    createView();

    act(() => {
      jest.advanceTimersByTime(AUTO_SAVE_INTERVAL_MS);
    });

    expect(useEditSession().mutate).toHaveBeenCalledTimes(1);
    expect(useEditSession().mutate).toHaveBeenCalledWith({
      _id: '5',
      auto_saved: true,
      name: 'test (autosaved)',
      summary: 'test',
      session: {
        table: {
          columnStates: {},
          selectedColumnIds: [],
          page: 0,
          resultsPerPage: 25,
          sort: {},
        },
        search: {
          searchParams: {
            dateRange: {},
            shotnumRange: {},
            maxShots: 50,
            experimentID: null,
          },
        },
        plots: {},
        filter: { appliedFilters: [[]] },
        windows: {},
      },
      timestamp: '',
    });
  });

  it('should not enable auto save if an user session is not selected', () => {
    createView();

    act(() => {
      jest.advanceTimersByTime(AUTO_SAVE_INTERVAL_MS);
    });

    expect(useEditSession().mutate).not.toHaveBeenCalledTimes(1);
  });

  it('save a user session', async () => {
    props.loadedSessionData = {
      name: 'test',
      summary: 'test',
      auto_saved: false,
      session: {},
      _id: '1',
      timestamp: '',
    };
    createView();
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeInTheDocument();

    await fireEvent.click(saveButton);

    await waitFor(() => {
      expect(useEditSession().mutate).toHaveBeenCalledTimes(1);
    });
  });

  it('opens the save dialog when there is not a user session selected', async () => {
    props.loadedSessionData = undefined;
    createView();
    const saveAsButton = screen.getByRole('button', { name: 'Save' });
    expect(saveAsButton).toBeInTheDocument();

    await fireEvent.click(saveAsButton);

    await waitFor(() => {
      expect(onSaveAsSessionClick).toHaveBeenCalledTimes(1);
    });
  });
  it('opens the save dialog when save as button is clicked', async () => {
    createView();
    const saveAsButton = screen.getByRole('button', { name: 'Save as' });
    expect(saveAsButton).toBeInTheDocument();

    await fireEvent.click(saveAsButton);

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
