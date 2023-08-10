import React from 'react';
import { screen, render, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SessionsDrawer from './sessionDrawer.component';

describe('session Drawer', () => {
  const openSessionSave = jest.fn();
  let user;
  const createView = (): RenderResult => {
    return render(<SessionsDrawer openSessionSave={openSessionSave} />);
  };
  beforeEach(() => {
    user = userEvent.setup();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { asFragment } = createView();
    expect(asFragment()).toMatchSnapshot();
  });

  it('opens dialogue when add button is clicked', async () => {
    createView();
    const button = screen.getByTestId('AddCircleIcon');
    await user.click(button);
    expect(openSessionSave).toHaveBeenCalled();
  });
});
