/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { RenderResult } from '@testing-library/react';
import {
  act,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ValidateFunctionState } from '../app.types';
import { operators, Token } from '../filtering/filterParser';
import {
  flushPromises,
  getInitialState,
  renderComponentWithProviders,
} from '../setupTests';
import { RootState } from '../state/store';
import DataView from './dataView.component';

describe('Data View', () => {
  const createView = (initialState?: Partial<RootState>): RenderResult => {
    return renderComponentWithProviders(<DataView />, {
      preloadedState: initialState,
    });
  };

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
    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument();
    expect(
      screen.queryByRole('dialog', { name: 'Filters' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Data Channels' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('dialog', { name: 'Data Channels' })
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
      table: { ...getInitialState().table, selectedColumnIds: ['shotnum'] },
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

    const shotnumHeader = await screen.findByRole('columnheader', {
      name: 'Shot Number',
    });
    await user.click(within(shotnumHeader).getByLabelText('open filters'));
    const dialogue = await screen.findByRole('dialog', { name: 'Filters' });
    expect(dialogue).toBeVisible();
  });

  it('opens the functions dialogue when the functions button in a data header is clicked', async () => {
    const user = userEvent.setup();
    const state = {
      ...getInitialState(),
      table: { ...getInitialState().table, selectedColumnIds: ['a'] },
      functions: {
        appliedFunctions: [
          {
            id: '1',
            name: 'a',
            expression: [{ type: 'number', label: '1', value: '1' }],
            dataType: 'scalar',
            channels: [],
          } as ValidateFunctionState,
        ],
      },
    };
    await act(async () => {
      createView(state);
      await flushPromises();
    });

    const functionAHeader = await screen.findByRole('columnheader', {
      name: 'a',
    });
    expect(functionAHeader).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Functions' }));
    const dialogue = await screen.findByRole('dialog', { name: 'Functions' });
    expect(dialogue).toBeVisible();

    await user.click(within(dialogue).getByRole('button', { name: 'Close' }));

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('dialog', { name: 'Functions' })
    );
  });

  it('opens the channels dialogue when the data channel button is clicked and closes when the close button is clicked', async () => {
    const user = userEvent.setup();
    await act(async () => {
      createView();
      await flushPromises();
    });

    await user.click(screen.getByRole('button', { name: 'Data Channels' }));

    const dialogue = await screen.findByRole('dialog', {
      name: 'Data Channels',
    });
    expect(dialogue).toBeVisible();

    await user.click(within(dialogue).getByRole('button', { name: 'Close' }));

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('dialog', { name: 'Data Channels' })
    );
  });

  it('collapses & expands search when the show/hide search button is clicked', async () => {
    const user = userEvent.setup();
    await act(async () => {
      createView();
      await flushPromises();
    });

    await user.click(screen.getByRole('button', { name: 'Hide search' }));

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Search' })
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Show search' }));

    expect(await screen.findByRole('button', { name: 'Search' })).toBeVisible();
  });
});
