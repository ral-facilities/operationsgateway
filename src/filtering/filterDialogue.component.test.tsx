import React from 'react';
import FilterDialogue from './filterDialogue.component';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  flushPromises,
  getInitialState,
  renderComponentWithProviders,
  testChannels,
  testRecords,
} from '../setupTests';
import { fetchChannels } from '../api/channels';
import { RootState } from '../state/store';
import { PreloadedState } from '@reduxjs/toolkit';
import { Token } from './filterParser';
import axios from 'axios';
import { QueryCache } from 'react-query';

describe('Filter dialogue component', () => {
  let props: React.ComponentProps<typeof FilterDialogue>;
  let promise;

  const createView = (initialState?: PreloadedState<RootState>) => {
    return renderComponentWithProviders(<FilterDialogue {...props} />, {
      preloadedState: initialState,
    });
  };

  beforeEach(() => {
    jest.setTimeout(60000);
    props = {
      open: true,
      onClose: jest.fn(),
    };

    promise = Promise.resolve({ data: testRecords });

    (axios.get as jest.Mock).mockReturnValue(promise);
  });

  it('renders filter dialogue when dialogue is open', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });

  it("doesn't render filter dialogue when dialogue is close", async () => {
    props.open = false;

    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByText('Close'));

    expect(props.onClose).toHaveBeenCalled();
  });

  it('dispatches changeAppliedFilters and onClose when apply button is clicked', async () => {
    const state = {
      ...getInitialState(),
      filter: {
        ...getInitialState().filter,
        appliedFilters: [
          [
            { type: 'channel', value: 'timestamp' },
            { type: 'unaryop', value: 'is not null' },
            { type: 'and', value: 'and' },
            { type: 'channel', value: 'shotnum' },
            { type: 'unaryop', value: 'is null' },
          ],
        ] as Token[][],
      },
    };
    const user = userEvent.setup();

    const { store } = createView(state);

    const filter = screen.getByRole('combobox', { name: 'Filter' });
    await user.type(filter, '{backspace}');
    await user.type(filter, '{backspace}');
    await user.type(filter, '{backspace}');

    expect(screen.getByText('Apply')).not.toBeDisabled();
    await user.click(screen.getByText('Apply'));

    expect(store.getState().filter.appliedFilters).toStrictEqual([
      [
        { type: 'channel', value: 'timestamp' },
        { type: 'unaryop', value: 'is not null' },
      ],
    ]);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('disables apply button when there are errors', async () => {
    const state = {
      ...getInitialState(),
      filter: {
        ...getInitialState().filter,
        appliedFilters: [
          [
            { type: 'channel', value: 'timestamp' },
            { type: 'unaryop', value: 'is not null' },
          ],
        ] as Token[][],
      },
    };
    const user = userEvent.setup();

    createView(state);

    const filter = screen.getByRole('combobox', { name: 'Filter' });
    await user.type(filter, '{backspace}');
    await user.tab();

    expect(screen.getByText('Apply')).toBeDisabled();
  });
});
