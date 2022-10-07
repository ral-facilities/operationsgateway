import React from 'react';
import PlotTitleField from './plotTitleField.component';
import { render, screen } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Plot Title Field', () => {
  let user;
  const changePlotTitle = jest.fn();

  const createView = (): RenderResult => {
    return render(<PlotTitleField changePlotTitle={changePlotTitle} />);
  };

  beforeEach(() => {
    user = userEvent.setup({ delay: null });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { asFragment } = createView();

    expect(asFragment()).toMatchSnapshot();
  });

  it('lets user change the plot title and calls changePlotTitle', async () => {
    createView();

    const titleInput = screen.getByRole('textbox', { name: 'Title' });

    await user.type(titleInput, 'Test title');

    expect(titleInput).toHaveValue('Test title');

    expect(changePlotTitle).toHaveBeenCalledWith('Test title');
  });
});
