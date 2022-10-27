import React from 'react';
import TableButtons from './tableButtons.component';
import { render, screen } from '@testing-library/react';
import axios from 'axios';
import userEvent from '@testing-library/user-event';

describe('Table buttons', () => {
  const openFilters = jest.fn();
  let user;

  const createView = () => {
    return render(<TableButtons openFilters={openFilters} />);
  };

  beforeEach(() => {
    user = userEvent.setup();
    (axios.get as jest.Mock).mockResolvedValue({ data: [] });
  });

  it('renders the buttons', async () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('calls openFilters when the filters button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(openFilters).toHaveBeenCalled();
  });
});
