import React from 'react';
import TableButtons from './tableButtons.component';
import {
  act,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderComponentWithProviders } from '../setupTests';
import axios from 'axios';

describe('Table buttons', () => {
  const createView = () => {
    return renderComponentWithProviders(<TableButtons />);
  };

  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({ data: [] });
  });

  it('renders the buttons', async () => {
    let view;
    await act(async () => {
      view = createView();
    });
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('opens the filter dialogue when the filters button is clicked and closes when the close button is clicked', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByRole('button', { name: 'Filters' }));

    const dialogue = await screen.findByRole('dialog', { name: 'Filters' });
    expect(dialogue).toBeVisible();

    await user.click(within(dialogue).getByRole('button', { name: 'Close' }));

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('dialog', { name: 'Filters' })
    );
  });
});
