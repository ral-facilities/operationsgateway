import React from 'react';
import SearchBar from './searchBar.component';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  renderComponentWithProviders,
  getInitialState,
  cleanupDatePickerWorkaround,
  applyDatePickerWorkaround,
} from '../setupTests';
import { PreloadedState } from '@reduxjs/toolkit';
import { RootState } from '../state/store';
import { MAX_SHOTS_VALUES } from './components/maxShots.component';
import { formatDateTimeForApi } from '../state/slices/searchSlice';
import { QueryClient } from '@tanstack/react-query';
import { rest } from 'msw';
import { server } from '../mocks/server';
import recordsJson from '../mocks/records.json';

describe('searchBar component', () => {
  let user;
  let props: React.ComponentProps<typeof SearchBar>;

  const createView = (
    initialState?: PreloadedState<RootState>,
    queryClient?: QueryClient
  ) => {
    return renderComponentWithProviders(<SearchBar {...props} />, {
      preloadedState: initialState,
      queryClient,
    });
  };

  beforeEach(() => {
    applyDatePickerWorkaround();
    user = userEvent.setup();
    props = {
      expanded: true,
    };
  });

  afterEach(() => {
    cleanupDatePickerWorkaround();
    jest.clearAllMocks();
  });

  it('dispatches changeSearchParams on search button click', async () => {
    const state = getInitialState();
    const { store } = createView(state);

    // Date-time fields

    const dateFilterFromDate = screen.getByLabelText('from, date-time input');
    const dateFilterToDate = screen.getByLabelText('to, date-time input');
    await user.type(dateFilterFromDate, '2022-01-01 00:00:00');
    await user.type(dateFilterToDate, '2022-01-02 00:00:00');

    // Shot number fields

    await user.click(screen.getByLabelText('open shot number search box'));
    const shotnumPopup = screen.getByRole('dialog');
    const shotnumMin = within(shotnumPopup).getByRole('spinbutton', {
      name: 'Min',
    });
    const shotnumMax = within(shotnumPopup).getByRole('spinbutton', {
      name: 'Max',
    });

    await user.type(shotnumMin, '1');
    await user.type(shotnumMax, '2');
    await user.click(screen.getByLabelText('close shot number search box'));

    // Max shots

    const maxShotsRadioGroup = screen.getByRole('radiogroup', {
      name: 'select max shots',
    });
    await user.click(
      within(maxShotsRadioGroup).getByLabelText('Select 1000 max shots')
    );

    // Initiate search

    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(store.getState().search.searchParams).toStrictEqual({
      dateRange: {
        fromDate: '2022-01-01T00:00:00',
        toDate: '2022-01-02T00:00:00',
      },
      shotnumRange: {
        min: 1,
        max: 2,
      },
      maxShots: 1000,
    });
  });

  it('sends default search parameters when none are amended by the user', async () => {
    const state = getInitialState();
    const { store } = createView(state);

    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(store.getState().search.searchParams).toStrictEqual({
      dateRange: {
        fromDate: undefined,
        toDate: undefined,
      },
      shotnumRange: {
        min: undefined,
        max: undefined,
      },
      maxShots: MAX_SHOTS_VALUES[0],
    });
  });

  it('displays a warning tooltip if record count is over record limit warning and only initiates search on second click', async () => {
    // Mock the returned count query response
    server.use(
      rest.get('/records/count', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(31));
      })
    );
    const state = {
      ...getInitialState(),
      config: {
        ...getInitialState().config,
        recordLimitWarning: 30, // lower than the returned count of 31
      },
    };
    const { store } = createView(state);

    // Input some test data for the search
    const dateFilterFromDate = screen.getByLabelText('from, date-time input');
    await user.type(dateFilterFromDate, '2022-01-01 00:00:00');

    // Try and search
    await user.click(screen.getByRole('button', { name: 'Search' }));

    // Tooltip warning should be present
    await user.hover(screen.getByRole('button', { name: 'Search' }));
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();

    // Store should not be updated, indicating search is yet to initiate
    expect(store.getState().search.searchParams).toStrictEqual({
      dateRange: {},
      shotnumRange: {},
      maxShots: MAX_SHOTS_VALUES[0],
    });

    // Try search again
    await user.click(screen.getByText('Search'));

    // Store should now be updated, indicating search initiated on second attempt
    expect(store.getState().search.searchParams).toStrictEqual({
      dateRange: {
        fromDate: '2022-01-01T00:00:00',
        toDate: undefined,
      },
      shotnumRange: {
        min: undefined,
        max: undefined,
      },
      maxShots: MAX_SHOTS_VALUES[0],
    });
  });

  it('does not show a warning tooltip if record count is over record limit warning but max shots is below record limit warning', async () => {
    // Mock the returned count query response
    server.use(
      rest.get('/records/count', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(100));
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

    // Input some test data for the search
    const dateFilterFromDate = screen.getByLabelText('from, date-time input');
    await user.type(dateFilterFromDate, '2022-01-01 00:00:00');

    // Try and search
    await user.click(screen.getByRole('button', { name: 'Search' }));

    // Tooltip warning should not be present
    await user.hover(screen.getByRole('button', { name: 'Search' }));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('displays a warning tooltip if previous search did not need one but the current one does', async () => {
    const state = {
      ...getInitialState(),
      config: {
        ...getInitialState().config,
        recordLimitWarning: 30, // lower than the returned count of 31
      },
    };
    createView(state);

    const dateFilterFromDate = screen.getByLabelText('from, date-time input');
    await user.type(dateFilterFromDate, '2022-01-01 00:00:00');

    await user.click(screen.getByRole('button', { name: 'Search' }));

    // Tooltip warning should not be present
    await user.hover(screen.getByRole('button', { name: 'Search' }));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Mock the returned count query response
    server.use(
      rest.get('/records/count', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(31));
      })
    );

    await user.clear(dateFilterFromDate);
    await user.type(dateFilterFromDate, '2022-01-02 00:00:00');

    await user.click(screen.getByRole('button', { name: 'Search' }));

    // Tooltip warning should be present
    await user.hover(screen.getByRole('button', { name: 'Search' }));
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  });

  it('does not show a warning tooltip for previous searches that already showed it', async () => {
    // Mock the returned count query response
    server.use(
      rest.get('/records/count', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(31));
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
            dateRange: { fromDate: '2022-01-01T00:00:00' },
            maxShots: 50,
            shotnumRange: {},
          },
          filters: [''],
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
    };
    const { store } = createView(state, testQueryClient);

    // Try and search by the previously cached search params
    const dateFilterFromDate = screen.getByLabelText('from, date-time input');
    await user.type(dateFilterFromDate, '2022-01-01 00:00:00');

    await user.click(screen.getByRole('button', { name: 'Search' }));

    // Tooltip warning should not be present
    await user.hover(screen.getByRole('button', { name: 'Search' }));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Store should be updated after one click of the search button
    expect(store.getState().search.searchParams).toStrictEqual({
      dateRange: {
        fromDate: '2022-01-01T00:00:00',
        toDate: undefined,
      },
      shotnumRange: {
        min: undefined,
        max: undefined,
      },
      maxShots: MAX_SHOTS_VALUES[0],
    });
  });

  describe('searches by relative timeframe', () => {
    let realDate;

    beforeEach(() => {
      // Mock the Date constructor to allow for accurate comparison between expected and actual dates
      const testDate = new Date('2022-01-11 12:00:00');
      realDate = Date;
      global.Date = class extends Date {
        constructor(date) {
          if (date) {
            return super(date);
          }
          return testDate;
        }
      };
    });

    afterEach(() => {
      global.Date = realDate;
    });

    it('minutes', async () => {
      const state = getInitialState();
      const { store } = createView(state);

      await user.click(screen.getByLabelText('open timeframe search box'));
      const timeframePopup = screen.getByRole('dialog');
      await user.click(
        within(timeframePopup).getByRole('button', { name: 'Last 10 mins' })
      );
      const expectedToDate = new Date('2022-01-11 12:00:00');
      const expectedFromDate = new Date('2022-01-11 11:50:00');
      await user.click(screen.getByLabelText('close timeframe search box'));
      await user.click(screen.getByRole('button', { name: 'Search' }));

      const actualFromDate =
        store.getState().search.searchParams.dateRange.fromDate;
      const actualToDate =
        store.getState().search.searchParams.dateRange.toDate;
      expect(actualFromDate).toBeDefined();
      expect(actualToDate).toBeDefined();

      expect(actualFromDate).toEqual(formatDateTimeForApi(expectedFromDate));
      expect(actualToDate).toEqual(formatDateTimeForApi(expectedToDate));
    });

    it('hours', async () => {
      const state = getInitialState();
      const { store } = createView(state);

      await user.click(screen.getByLabelText('open timeframe search box'));
      const timeframePopup = screen.getByRole('dialog');
      await user.click(
        within(timeframePopup).getByRole('button', { name: 'Last 24 hours' })
      );
      const expectedToDate = new Date('2022-01-11 12:00:00');
      const expectedFromDate = new Date('2022-01-10 12:00:00');
      await user.click(screen.getByLabelText('close timeframe search box'));
      await user.click(screen.getByRole('button', { name: 'Search' }));

      const actualFromDate =
        store.getState().search.searchParams.dateRange.fromDate;
      const actualToDate =
        store.getState().search.searchParams.dateRange.toDate;
      expect(actualFromDate).toBeDefined();
      expect(actualToDate).toBeDefined();

      expect(actualFromDate).toEqual(formatDateTimeForApi(expectedFromDate));
      expect(actualToDate).toEqual(formatDateTimeForApi(expectedToDate));
    });

    it('days', async () => {
      const state = getInitialState();
      const { store } = createView(state);

      await user.click(screen.getByLabelText('open timeframe search box'));
      const timeframePopup = screen.getByRole('dialog');
      await user.click(
        within(timeframePopup).getByRole('button', { name: 'Last 7 days' })
      );
      const expectedToDate = new Date('2022-01-11 12:00:00');
      const expectedFromDate = new Date('2022-01-04 12:00:00');
      await user.click(screen.getByLabelText('close timeframe search box'));
      await user.click(screen.getByRole('button', { name: 'Search' }));

      const actualFromDate =
        store.getState().search.searchParams.dateRange.fromDate;
      const actualToDate =
        store.getState().search.searchParams.dateRange.toDate;
      expect(actualFromDate).toBeDefined();
      expect(actualToDate).toBeDefined();

      expect(actualFromDate).toEqual(formatDateTimeForApi(expectedFromDate));
      expect(actualToDate).toEqual(formatDateTimeForApi(expectedToDate));
    });

    it('refreshes datetime stamps and launches search if timeframe is set and refresh button clicked', async () => {
      const state = getInitialState();
      const { store } = createView(state);

      // Set a relative timestamp and verify the initial seach is correct

      await user.click(screen.getByLabelText('open timeframe search box'));
      const timeframePopup = screen.getByRole('dialog');
      await user.click(
        within(timeframePopup).getByRole('button', {
          name: 'Last 10 mins',
        })
      );
      const expectedToDate = new Date('2022-01-11 12:00:00');
      const expectedFromDate = new Date('2022-01-11 11:50:00');
      await user.click(screen.getByLabelText('close timeframe search box'));
      await user.click(screen.getByRole('button', { name: 'Search' }));

      const actualFromDate =
        store.getState().search.searchParams.dateRange.fromDate;
      const actualToDate =
        store.getState().search.searchParams.dateRange.toDate;
      expect(actualFromDate).toBeDefined();
      expect(actualToDate).toBeDefined();

      expect(actualFromDate).toEqual(formatDateTimeForApi(expectedFromDate));
      expect(actualToDate).toEqual(formatDateTimeForApi(expectedToDate));

      // Mock a new date constructor to simulate time moving forward a minute

      const testDate = new Date('2022-01-11 12:01:00');
      realDate = Date;
      global.Date = class extends Date {
        constructor(date) {
          if (date) {
            return super(date);
          }
          return testDate;
        }
      };

      await user.click(screen.getByRole('button', { name: 'Refresh data' }));
      const newExpectedToDate = new Date('2022-01-11 12:01:00');
      const newExpectedFromDate = new Date('2022-01-11 11:51:00');

      const newActualFromDate =
        store.getState().search.searchParams.dateRange.fromDate;
      const newActualToDate =
        store.getState().search.searchParams.dateRange.toDate;
      expect(newActualFromDate).toBeDefined();
      expect(newActualToDate).toBeDefined();

      // Check that the new datetime stamps have each moved forward a minute

      expect(newActualFromDate).toEqual(
        formatDateTimeForApi(newExpectedFromDate)
      );
      expect(newActualToDate).toEqual(formatDateTimeForApi(newExpectedToDate));
    });
  });

  it('displays nothing if expanded is false', async () => {
    props = { expanded: false };
    const { container } = createView();

    expect(container).toBeEmptyDOMElement();
  });
});
