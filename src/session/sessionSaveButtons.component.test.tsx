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
import { useEditSession } from '../api/sessions';

// Mock the useEditSession hook
jest.mock('../api/sessions', () => ({
  useEditSession: jest.fn(),
}));

describe('session buttons', () => {
  let props: SessionsSaveButtonsProps;
  const onSaveAsSessionClick = jest.fn();
  const refetchSessionsList = jest.fn();
  const createView = (): RenderResult => {
    return renderComponentWithProviders(<SessionSaveButtons {...props} />);
  };

  beforeEach(() => {
    props = {
      sessionId: undefined,
      onSaveAsSessionClick: onSaveAsSessionClick,
      selectedSessionData: undefined,
      selectedSessionTimestamp: { timestamp: undefined, autoSaved: undefined },
      refetchSessionsList: refetchSessionsList,
    };
    jest.useFakeTimers();

    // Mock the return value of useEditSession hook
    useEditSession.mockReturnValue({
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

  it('should enable auto save if an user session is selected', () => {
    props.selectedSessionData = {
      name: 'test',
      summary: 'test',
      auto_saved: false,
      session: {},
      _id: '1',
      timestamp: '',
    };
    props.sessionId = '1';
    const { rerender } = createView();

    act(() => {
      jest.advanceTimersByTime(AUTO_SAVE_INTERVAL_MS);
    });

    expect(useEditSession().mutateAsync).toHaveBeenCalledTimes(1);
    expect(useEditSession().mutateAsync).toHaveBeenCalledWith({
      _id: '1',
      auto_saved: true,
      name: 'test',
      summary: 'test',
      timestamp: '',
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

    props.selectedSessionData = {
      name: 'test 2',
      summary: 'test 2',
      auto_saved: false,
      session: {},
      _id: '2',
      timestamp: '',
    };
    props.sessionId = '2';
    rerender(<SessionSaveButtons {...props} />);

    act(() => {
      jest.advanceTimersByTime(AUTO_SAVE_INTERVAL_MS);
    });

    expect(useEditSession().mutateAsync).toHaveBeenCalledTimes(2);
    expect(useEditSession().mutateAsync).toHaveBeenCalledWith({
      _id: '2',
      auto_saved: true,
      name: 'test 2',
      summary: 'test 2',
      timestamp: '',
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

    act(() => {
      jest.advanceTimersByTime(AUTO_SAVE_INTERVAL_MS);
    });

    expect(useEditSession().mutateAsync).toHaveBeenCalledTimes(3);
    expect(useEditSession().mutateAsync).toHaveBeenCalledWith({
      _id: '2',
      auto_saved: true,
      name: 'test 2',
      summary: 'test 2',
      timestamp: '',
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

  it('should not enable auto save if an user session is not selected', () => {
    createView();

    act(() => {
      jest.advanceTimersByTime(AUTO_SAVE_INTERVAL_MS);
    });

    expect(useEditSession().mutateAsync).not.toHaveBeenCalledTimes(1);
  });

  it('save a user session', async () => {
    props.selectedSessionData = {
      name: 'test',
      summary: 'test',
      auto_saved: false,
      session_data: '{}',
      _id: '1',
    };
    createView();
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeInTheDocument();

    await fireEvent.click(saveButton);

    await waitFor(() => {
      expect(useEditSession().mutateAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('opens the save dialog when there is not a user session selected', async () => {
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
      selectedSessionTimestamp: {
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
      selectedSessionTimestamp: {
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
