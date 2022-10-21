/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import FilterDialogue from './filterDialogue.component';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  getInitialState,
  renderComponentWithProviders,
  testRecords,
} from '../setupTests';
import { RootState } from '../state/store';
import { PreloadedState } from '@reduxjs/toolkit';
import { operators, Token } from './filterParser';
import axios from 'axios';

describe('Filter dialogue component', () => {
  let props: React.ComponentProps<typeof FilterDialogue>;

  const createView = (initialState?: PreloadedState<RootState>) => {
    return renderComponentWithProviders(<FilterDialogue {...props} />, {
      preloadedState: initialState,
    });
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: jest.fn(),
    };

    (axios.get as jest.Mock).mockResolvedValue({ data: testRecords });
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
            { type: 'channel', value: 'timestamp', label: 'timestamp' },
            operators.find((t) => t.value === 'is not null')!,
            operators.find((t) => t.value === 'and')!,
            { type: 'channel', value: 'shotnum', label: 'Shot Number' },
            operators.find((t) => t.value === 'is null')!,
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
        { type: 'channel', value: 'timestamp', label: 'timestamp' },
        operators.find((t) => t.value === 'is not null')!,
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
            { type: 'channel', value: 'timestamp', label: 'timestamp' },
            operators.find((t) => t.value === 'is not null')!,
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
