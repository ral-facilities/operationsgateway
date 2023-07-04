import React from 'react';
import { screen, type RenderResult, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SessionsDrawer, { SessionDrawerProps } from './sessionDrawer.component';
import { renderComponentWithProviders } from '../setupTests';

describe('session Drawer', () => {
  const openSessionSave = jest.fn();
  const onChangeSessionId = jest.fn();
  let user;
  let props: SessionDrawerProps;
  const createView = (): RenderResult => {
    return renderComponentWithProviders(<SessionsDrawer {...props} />);
  };
  beforeEach(() => {
    user = userEvent.setup();
    props = {
      openSessionSave: openSessionSave,
      sessionId: undefined,
      onChangeSessionId: onChangeSessionId,
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
    createView();

    await waitFor(() => {
      expect(screen.getByText('Session 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Session 2')).toBeInTheDocument();
    expect(screen.getByText('Session 3')).toBeInTheDocument();
    const session1 = screen.getByText('Session 1');
    await user.click(session1);
    expect(onChangeSessionId).toHaveBeenCalledWith('1');

    expect(session1).toHaveStyle('background-color: background.paper');
    expect(session1).toHaveStyle('color: inherit');
  });
});
