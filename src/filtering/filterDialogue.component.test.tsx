import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';
import recordsJson from '../mocks/records.json';
import { server } from '../mocks/server';
import { RootState } from '../state/store';
import { getInitialState, renderComponentWithProviders } from '../testUtils';
import FilterDialogue from './filterDialogue.component';
import { operators, Token } from './filterParser';

describe('Filter dialogue component', () => {
  let props: React.ComponentProps<typeof FilterDialogue>;
  let user: UserEvent;

  const createView = (
    initialState?: Partial<RootState>,
    queryClient?: QueryClient
  ) => {
    return renderComponentWithProviders(<FilterDialogue {...props} />, {
      preloadedState: initialState,
      queryClient,
    });
  };

  beforeEach(() => {
    user = userEvent.setup();
    props = {
      open: true,
      onClose: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders filter dialogue when dialogue is open (filter section)', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('renders filter dialogue when dialogue is open (favourite filter section)', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    await user.click(screen.getByText('Favourite filters'));
    expect(
      await screen.findByRole('button', { name: 'Add new favourite filter' })
    ).toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();
  });

  it('opens and closes Add new favourite filter dialogue', async () => {
    createView();

    await user.click(screen.getByText('Favourite filters'));
    await user.click(
      await screen.findByRole('button', {
        name: 'Edit test 1 favourite filter',
      })
    );

    expect(screen.getAllByText('Close').length).toEqual(2);

    await user.click(screen.getAllByText('Close')[1]);
    await waitFor(() => {
      expect(screen.getAllByText('Close').length).toEqual(1);
    });
  });

  it('opens and closes edit new favourite filter dialogue', async () => {
    createView();

    await user.click(screen.getByText('Favourite filters'));
    await user.click(
      await screen.findByRole('button', { name: 'Add new favourite filter' })
    );

    expect(screen.getAllByText('Close').length).toEqual(2);

    await user.click(screen.getAllByText('Close')[1]);
    await waitFor(() => {
      expect(screen.getAllByText('Close').length).toEqual(1);
    });
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
            { type: 'channel', value: 'type', label: 'Type' },
            operators.find((t) => t.value === 'is not null')!,
            operators.find((t) => t.value === 'and')!,
            { type: 'channel', value: 'shotnum', label: 'Shot Number' },
            operators.find((t) => t.value === 'is null')!,
          ],
        ] as Token[][],
      },
    };

    const { store } = createView(state);

    const filter = screen.getByRole('combobox', { name: 'Filter' });
    await user.type(filter, '{backspace}');
    await user.type(filter, '{backspace}');
    await user.type(filter, '{backspace}');

    expect(screen.getByText('Apply')).not.toBeDisabled();
    await user.click(screen.getByText('Apply'));

    expect(store.getState().filter.appliedFilters).toStrictEqual([
      [
        { type: 'channel', value: 'type', label: 'Type' },
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
            { type: 'channel', value: 'type', label: 'type' },
            operators.find((t) => t.value === 'is not null')!,
          ],
        ] as Token[][],
      },
    };

    createView(state);

    const filter = screen.getByRole('combobox', { name: 'Filter' });
    await user.type(filter, '{backspace}');
    await user.tab();

    expect(screen.getByText('Apply')).toBeDisabled();
  });

  it('adds new filter when Add new filter button is clicked and renders multiple filters, and updates store with multiple filters when applied', async () => {
    const { store } = createView();

    await user.click(screen.getByText('Add new filter'));

    const filters = screen.getAllByRole('combobox', { name: 'Filter' });
    expect(filters).toHaveLength(2);

    const [filter1, filter2] = filters;
    await user.type(filter1, 'Act{enter}is{enter}');
    await user.type(filter2, 'sh{enter}={enter}1{enter}');
    await user.tab();

    expect(screen.getByText('Apply')).not.toBeDisabled();
    await user.click(screen.getByText('Apply'));

    expect(store.getState().filter.appliedFilters).toStrictEqual([
      [
        {
          type: 'channel',
          value: 'activeArea',
          label: 'Active Area',
        },
        operators.find((t) => t.value === 'is not null')!,
      ],
      [
        { type: 'channel', value: 'shotnum', label: 'Shot Number' },
        operators.find((t) => t.value === '=')!,
        { type: 'number', value: '1', label: '1' },
      ],
    ]);
  });

  it('deletes a filter when delete button is clicked', async () => {
    const state = {
      ...getInitialState(),
      filter: {
        ...getInitialState().filter,
        appliedFilters: [
          [
            { type: 'channel', value: 'type', label: 'type' },
            operators.find((t) => t.value === 'is not null')!,
          ],
          [
            { type: 'channel', value: 'shotnum', label: 'Shot Number' },
            operators.find((t) => t.value === 'is not null')!,
          ],
        ] as Token[][],
      },
    };

    const { store } = createView(state);

    expect(screen.getAllByRole('combobox', { name: 'Filter' })).toHaveLength(2);

    await user.click(screen.getByLabelText('Delete filter 0'));

    expect(screen.getAllByRole('combobox', { name: 'Filter' })).toHaveLength(1);

    await user.click(screen.getByText('Apply'));

    // ensure correct filter was deleted
    expect(store.getState().filter.appliedFilters).toStrictEqual([
      [
        { type: 'channel', value: 'shotnum', label: 'Shot Number' },
        operators.find((t) => t.value === 'is not null')!,
      ],
    ]);
  });

  it('filters out empty arrays but leaves at least one if all filters are empty', async () => {
    const state = {
      ...getInitialState(),
      filter: {
        ...getInitialState().filter,
        appliedFilters: [
          [
            { type: 'channel', value: 'type', label: 'type' },
            operators.find((t) => t.value === 'is not null')!,
          ],
        ] as Token[][],
      },
    };

    const { store } = createView(state);

    await user.click(screen.getByText('Add new filter'));
    await user.click(screen.getByText('Add new filter'));
    await user.click(screen.getByText('Add new filter'));

    await user.click(screen.getByText('Apply'));

    expect(store.getState().filter.appliedFilters).toStrictEqual([
      [
        { type: 'channel', value: 'type', label: 'type' },
        operators.find((t) => t.value === 'is not null')!,
      ],
    ]);

    await user.click(screen.getByLabelText('Delete filter 0'));

    await user.click(screen.getByText('Add new filter'));
    await user.click(screen.getByText('Add new filter'));
    await user.click(screen.getByText('Add new filter'));

    await user.click(screen.getByText('Apply'));

    expect(store.getState().filter.appliedFilters).toStrictEqual([[]]);
  });

  it("doesn't pass timestamp as a filterable channel", async () => {
    createView();

    const filter = screen.getByRole('combobox', { name: 'Filter' });
    await user.type(filter, 'time');
    // i.e. there's no suggestions in the autocomplete
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('displays a warning tooltip if record count is over record limit warning and only initiates search on second click', async () => {
    // Mock the returned count query response
    server.use(
      http.get('/records/count', () => HttpResponse.json(31, { status: 200 }))
    );

    const state = {
      ...getInitialState(),
      config: {
        ...getInitialState().config,
        recordLimitWarning: 30, // lower than the returned count of 31
      },
    };
    const { store } = createView(state);

    await user.click(screen.getByText('Add new filter'));

    expect(screen.getAllByRole('combobox', { name: 'Filter' })).toHaveLength(2);

    const filter1 = screen.getAllByRole('combobox', { name: 'Filter' })[0];
    await user.type(filter1, 'Act{enter}is{enter}');
    await user.tab();

    expect(screen.getByText('Apply')).not.toBeDisabled();
    await user.click(screen.getByText('Apply'));

    // Tooltip warning should be present
    await user.hover(screen.getByText('Apply'));

    // for some strange reason, the tooltip is not being found on the first hover
    // re-trying the hover makes the test pass
    await user.hover(screen.getByText('Apply'));

    expect(await screen.findByRole('tooltip')).toBeInTheDocument();

    // // Store should not be updated, indicating search is yet to initiate
    expect(store.getState().filter.appliedFilters).toStrictEqual([[]]);

    // Try search again
    await user.click(screen.getByText('Apply'));

    // Store should now be updated, indicating search initiated on second attempt
    expect(store.getState().filter.appliedFilters).toStrictEqual([
      [
        {
          type: 'channel',
          value: 'activeArea',
          label: 'Active Area',
        },
        operators.find((t) => t.value === 'is not null')!,
      ],
    ]);
  });

  it('displays a warning tooltip if previous filter did not need one but the current one does', async () => {
    const state = {
      ...getInitialState(),
      config: {
        ...getInitialState().config,
        recordLimitWarning: 30, // lower than the returned count of 31
      },
    };
    createView(state);

    await user.click(screen.getByText('Add new filter'));

    expect(screen.getAllByRole('combobox', { name: 'Filter' })).toHaveLength(2);

    const filter1 = screen.getAllByRole('combobox', { name: 'Filter' })[0];
    await user.type(filter1, 'Act{enter}is{enter}');
    await user.tab();

    expect(screen.getByText('Apply')).not.toBeDisabled();
    await user.click(screen.getByText('Apply'));

    // Tooltip warning should not be present
    await user.hover(screen.getByText('Apply'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Mock the returned count query response
    server.use(
      http.get('/records/count', () => {
        return HttpResponse.json(31, { status: 200 });
      })
    );

    await user.type(filter1, '{backspace}={enter}1{enter}');
    await user.tab();

    await user.click(screen.getByText('Apply'));

    // Tooltip warning should be present
    await user.hover(screen.getByText('Apply'));

    // for some strange reason, the tooltip is not being found on the first hover
    // re-trying the hover makes the test pass
    await user.hover(screen.getByText('Apply'));

    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  });

  it('does not show a warning tooltip if record count is over record limit warning but max shots is below record limit warning', async () => {
    // Mock the returned count query response
    server.use(
      http.get('/records/count', () => {
        return HttpResponse.json(100, { status: 200 });
      })
    );

    const state = {
      ...getInitialState(),
      search: {
        ...getInitialState().search,
        maxShots: 50,
      },
      config: {
        ...getInitialState().config,
        recordLimitWarning: 75, // lower than the returned count of 100
      },
    };
    createView(state);

    await user.click(screen.getByText('Add new filter'));

    expect(screen.getAllByRole('combobox', { name: 'Filter' })).toHaveLength(2);

    const filter1 = screen.getAllByRole('combobox', { name: 'Filter' })[0];
    await user.type(filter1, 'Act{enter}is{enter}');
    await user.tab();

    expect(screen.getByText('Apply')).not.toBeDisabled();
    await user.click(screen.getByText('Apply'));

    // Tooltip warning should not be present
    await user.hover(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('does not show a warning tooltip for previous searches that already showed it', async () => {
    // Mock the returned count query response
    server.use(
      http.get('/records/count', () => {
        return HttpResponse.json(31, { status: 200 });
      })
    );

    const testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 300000,
        },
      },
    });
    testQueryClient.setQueryData(
      [
        'records',
        {
          searchParams: {
            dateRange: {},
            maxShots: 50,
            shotnumRange: {},
            experimentID: null,
          },
          filters: ['{"metadata.activeArea":{"$ne":null}}'],
        },
      ],
      () => {
        return { data: [recordsJson[0], recordsJson[1]] };
      }
    );

    const state = {
      ...getInitialState(),
      config: {
        ...getInitialState().config,
        recordLimitWarning: 30, // lower than the returned count of 31
      },
      search: {
        ...getInitialState().search,
        searchParams: {
          ...getInitialState().search.searchParams,
          dateRange: {},
        },
      },
    };
    const { store } = createView(state, testQueryClient);

    const filter = screen.getByRole('combobox', { name: 'Filter' });
    await user.type(filter, 'Act{enter}is{enter}');
    await user.tab();

    expect(screen.getByText('Apply')).not.toBeDisabled();
    await user.click(screen.getByText('Apply'));

    // Tooltip warning should not be present
    await user.hover(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Store should now be updated, indicating search initiated
    expect(store.getState().filter.appliedFilters).toStrictEqual([
      [
        {
          type: 'channel',
          value: 'activeArea',
          label: 'Active Area',
        },
        operators.find((t) => t.value === 'is not null')!,
      ],
    ]);
  });
});
