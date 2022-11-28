/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import {
  act,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataView from './dataView.component';
import {
  flushPromises,
  renderComponentWithProviders,
  testRecords,
  getInitialState,
} from '../setupTests';
import axios from 'axios';
import { operators, Token } from '../filtering/filterParser';
import { PreloadedState } from '@reduxjs/toolkit';
import { RootState } from '../state/store';

describe('Data View', () => {
  const createView = (
    initialState?: PreloadedState<RootState>
  ): RenderResult => {
    return renderComponentWithProviders(<DataView />, {
      preloadedState: initialState,
    });
  };

  beforeEach(() => {
    (axios.get as jest.Mock).mockImplementation((url: string) => {
      switch (url) {
        case '/records':
          return Promise.resolve({ data: testRecords });
        case '/records/count':
          return Promise.resolve({ data: testRecords.length });
        default:
          return Promise.reject(new Error('Invalid URL'));
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    await act(async () => {
      createView();
      await flushPromises();
    });

    expect(
      screen.getByRole('textbox', { name: 'from, date-time input' })
    ).toBeInTheDocument();
    expect(screen.getByRole('table-container')).toBeInTheDocument();
    expect(screen.getByLabelText('table checkboxes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument();
    expect(
      screen.queryByRole('dialog', { name: 'Filters' })
    ).not.toBeInTheDocument();
  });

  it('opens the filter dialogue when the filters button is clicked and closes when the close button is clicked', async () => {
    const user = userEvent.setup();
    await act(async () => {
      createView();
      await flushPromises();
    });

    await user.click(screen.getByRole('button', { name: 'Filters' }));

    const dialogue = await screen.findByRole('dialog', { name: 'Filters' });
    expect(dialogue).toBeVisible();

    await user.click(within(dialogue).getByRole('button', { name: 'Close' }));

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('dialog', { name: 'Filters' })
    );
  });

  it('opens the filter dialogue when the filter button in a data header is clicked', async () => {
    const user = userEvent.setup();
    const state = {
      ...getInitialState(),
      filter: {
        ...getInitialState().filter,
        appliedFilters: [
          [
            { type: 'channel', value: 'shotnum', label: 'Shot Number' },
            operators.find((t) => t.value === 'is null')!,
          ],
        ] as Token[][],
      },
    };
    await act(async () => {
      createView(state);
      await flushPromises();
    });

    await act(async () => {
      screen.getByLabelText('shotnum checkbox').click();
      await flushPromises();
    });

    const shotnumHeader = screen.getByRole('columnheader', {
      name: 'shotnum header',
    });
    await user.click(within(shotnumHeader).getByLabelText('open filters'));
    const dialogue = await screen.findByRole('dialog', { name: 'Filters' });
    expect(dialogue).toBeVisible();
  });

  it('collapses & expands search when the show/hide search button is clicked', async () => {
    const user = userEvent.setup();
    await act(async () => {
      createView();
      await flushPromises();
    });

    await user.click(screen.getByRole('button', { name: 'Hide search' }));

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('button', { name: 'Search' })
    );

    await user.click(screen.getByRole('button', { name: 'Show search' }));

    expect(await screen.findByRole('button', { name: 'Search' })).toBeVisible();
  });
});
