import React from 'react';
import { screen, type RenderResult, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SessionsDrawer, { SessionDrawerProps } from './sessionDrawer.component';
import { renderComponentWithProviders } from '../setupTests';
import SessionsListJSON from '../mocks/sessionsList.json';

describe('session Drawer', () => {
  const openSessionSave = jest.fn();
  const openSessionEdit = jest.fn();
  const openSessionDelete = jest.fn();
  const onChangeLoadedSessionId = jest.fn();
  const onChangeSelectedSessionTimestamp = jest.fn();
  const refetchSessionsData = jest.fn();
  let user;
  let props: SessionDrawerProps;
  const createView = (): RenderResult => {
    return renderComponentWithProviders(<SessionsDrawer {...props} />);
  };
  beforeEach(() => {
    user = userEvent.setup();
    props = {
      openSessionSave: openSessionSave,
      openSessionEdit: openSessionEdit,
      openSessionDelete: openSessionDelete,
      loadedSessionId: undefined,
      onChangeLoadedSessionId: onChangeLoadedSessionId,
      sessionsList: SessionsListJSON,
      onChangeSelectedSessionTimestamp: onChangeSelectedSessionTimestamp,
      refetchSessionsData: refetchSessionsData,
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const { asFragment } = createView();
    await waitFor(() => {
      expect(screen.getByText('Session 1')).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it('opens dialogue when add button is clicked', async () => {
    createView();
    const button = screen.getByTestId('AddCircleIcon');
    await user.click(button);
    expect(openSessionSave).toHaveBeenCalled();
  });

  it('loads a user session', async () => {
    props.selectedSessionId = '1';
    createView();
    await waitFor(() => {
      expect(screen.getByText('Session 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Session 2')).toBeInTheDocument();
    expect(screen.getByText('Session 3')).toBeInTheDocument();
    const session1 = screen.getByText('Session 1');
    await user.click(session1);
    expect(onChangeLoadedSessionId).toHaveBeenCalledWith('1');

    await waitFor(() => {
      expect(session1).toHaveStyle('background-color: primary.main');
    });

    expect(onChangeSelectedSessionTimestamp).toHaveBeenCalledWith(
      '2023-06-29T10:30:00Z',
      true
    );
    expect(refetchSessionsData).toHaveBeenCalledWith('1');
  });

  it('a user can open the edit session dialogue', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Session 1')).toBeInTheDocument();
    });
    const editButtons = screen.getAllByTestId('edit-session-button');
    await user.click(editButtons[0]);
    expect(openSessionEdit).toHaveBeenCalled();
  });

  it('a user can open the delete session dialogue', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Session 1')).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByTestId('delete-session-button');
    await user.click(deleteButtons[0]);
    expect(openSessionDelete).toHaveBeenCalled();
  });
});
