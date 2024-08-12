import { screen, waitFor, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SessionsListJSON from '../mocks/sessionsList.json';
import { renderComponentWithProviders } from '../setupTests';
import SessionsDrawer, { SessionDrawerProps } from './sessionDrawer.component';

describe('session Drawer', () => {
  const openSessionSave = jest.fn();
  const openSessionEdit = jest.fn();
  const openSessionDelete = jest.fn();
  const onChangeLoadedSessionId = jest.fn();
  const onChangeLoadedSessionTimestamp = jest.fn();
  const onChangeAutoSaveSessionId = jest.fn();
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
      loadedSessionData: undefined,
      onChangeLoadedSessionId: onChangeLoadedSessionId,
      sessionsList: SessionsListJSON,
      onChangeLoadedSessionTimestamp: onChangeLoadedSessionTimestamp,
      onChangeAutoSaveSessionId: onChangeAutoSaveSessionId,
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
    props.loadedSessionId = '1';
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

    expect(onChangeLoadedSessionTimestamp).toHaveBeenCalledWith(
      '2023-06-29T10:30:00',
      true
    );

    expect(onChangeAutoSaveSessionId).toHaveBeenCalledWith(undefined);
  });

  it('a user can open the edit session dialogue', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Session 1')).toBeInTheDocument();
    });
    const editButton = screen.getByRole('button', {
      name: 'edit Session 1 session',
    });
    await user.click(editButton);
    expect(openSessionEdit).toHaveBeenCalled();
  });

  it('a user can open the delete session dialogue', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Session 1')).toBeInTheDocument();
    });
    const deleteButton = screen.getByRole('button', {
      name: 'delete Session 1 session',
    });
    await user.click(deleteButton);
    expect(openSessionDelete).toHaveBeenCalled();
  });
});
