import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import SessionsButtons from './sessionSaveButtons.component';

describe('session buttons', () => {
  const createView = (): RenderResult => {
    return render(<SessionsButtons />);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { asFragment } = createView();
    expect(asFragment()).toMatchSnapshot();
  });
});
