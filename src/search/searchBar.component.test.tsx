import React from 'react';
import SearchBar from './searchBar.component';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderComponentWithProviders, getInitialState } from '../setupTests';
import { PreloadedState } from '@reduxjs/toolkit';
import { RootState } from '../state/store';

describe('searchBar component', () => {
  let user;

  const createView = (initialState?: PreloadedState<RootState>) => {
    return renderComponentWithProviders(<SearchBar />, {
      preloadedState: initialState,
    });
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('dispatches changeSearchParams on search button click', async () => {
    const state = getInitialState();
    const { store } = createView(state);

    await user.click(screen.getByLabelText('open shot number search box'));
    const shotnumPopup = screen.getByRole('dialog');
    const shotnumMin = within(shotnumPopup).getByRole('spinbutton', {
      name: 'Min',
    });
    const shotnumMax = within(shotnumPopup).getByRole('spinbutton', {
      name: 'Max',
    });
    await user.clear(shotnumMin);
    await user.clear(shotnumMax);
    await user.type(shotnumMin, '1');
    await user.type(shotnumMax, '2');
    await user.click(screen.getByLabelText('close shot number search box'));
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(store.getState().search.searchParams).toStrictEqual({
      dateRange: {
        fromDate: undefined,
        toDate: undefined,
      },
      shotnumRange: {
        min: 1,
        max: 2,
      },
    });
  });
});
