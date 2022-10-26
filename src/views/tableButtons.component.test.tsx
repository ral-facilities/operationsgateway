import React from 'react';
import TableButtons from './tableButtons.component';
import { act, render } from '@testing-library/react';
import axios from 'axios';

describe('Table buttons', () => {
  const openFilters = jest.fn();

  const createView = () => {
    return render(<TableButtons openFilters={openFilters} />);
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
});
