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
import { format } from 'date-fns';

describe('searchBar component', () => {
  let user;
  let props: React.ComponentProps<typeof SearchBar>;

  const createView = (initialState?: PreloadedState<RootState>) => {
    return renderComponentWithProviders(<SearchBar {...props} />, {
      preloadedState: initialState,
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
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(store.getState().search.searchParams).toStrictEqual({
      dateRange: {
        fromDate: '2022-01-01 00:00:00',
        toDate: '2022-01-02 00:00:00',
      },
      shotnumRange: {
        min: 1,
        max: 2,
      },
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
    });
  });

  describe('searches by relative timeframe', () => {
    let realDate;

    beforeEach(() => {
      // Mock the Date constructor to allow for accurate comparison between expected and actual dates
      const testDate = new Date('2022-01-01 00:00:00');
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
      const expectedToDate = new Date();
      const expectedFromDate = new Date(expectedToDate).setMinutes(
        expectedToDate.getMinutes() - 10
      );
      await user.click(screen.getByLabelText('close timeframe search box'));
      await user.click(screen.getByRole('button', { name: 'Search' }));

      const actualFromDate =
        store.getState().search.searchParams.dateRange.fromDate;
      const actualToDate =
        store.getState().search.searchParams.dateRange.toDate;
      expect(actualFromDate).toBeDefined();
      expect(actualToDate).toBeDefined();

      expect(format(expectedFromDate, 'yyyy-MM-dd HH:mm:ss')).toEqual(
        actualFromDate
      );
      expect(format(expectedToDate, 'yyyy-MM-dd HH:mm:ss')).toEqual(
        actualToDate
      );
    });

    it('hours', async () => {
      const state = getInitialState();
      const { store } = createView(state);

      await user.click(screen.getByLabelText('open timeframe search box'));
      const timeframePopup = screen.getByRole('dialog');
      await user.click(
        within(timeframePopup).getByRole('button', { name: 'Last 24 hours' })
      );
      const expectedToDate = new Date();
      const expectedFromDate = new Date(expectedToDate).setHours(
        expectedToDate.getHours() - 24
      );
      await user.click(screen.getByLabelText('close timeframe search box'));
      await user.click(screen.getByRole('button', { name: 'Search' }));

      const actualFromDate =
        store.getState().search.searchParams.dateRange.fromDate;
      const actualToDate =
        store.getState().search.searchParams.dateRange.toDate;
      expect(actualFromDate).toBeDefined();
      expect(actualToDate).toBeDefined();

      expect(format(expectedFromDate, 'yyyy-MM-dd HH:mm:ss')).toEqual(
        actualFromDate
      );
      expect(format(expectedToDate, 'yyyy-MM-dd HH:mm:ss')).toEqual(
        actualToDate
      );
    });

    it('days', async () => {
      const state = getInitialState();
      const { store } = createView(state);

      await user.click(screen.getByLabelText('open timeframe search box'));
      const timeframePopup = screen.getByRole('dialog');
      await user.click(
        within(timeframePopup).getByRole('button', { name: 'Last 7 days' })
      );
      const expectedToDate = new Date();
      const expectedFromDate = new Date(expectedToDate).setDate(
        expectedToDate.getDate() - 7
      );
      await user.click(screen.getByLabelText('close timeframe search box'));
      await user.click(screen.getByRole('button', { name: 'Search' }));

      const actualFromDate =
        store.getState().search.searchParams.dateRange.fromDate;
      const actualToDate =
        store.getState().search.searchParams.dateRange.toDate;
      expect(actualFromDate).toBeDefined();
      expect(actualToDate).toBeDefined();

      expect(format(expectedFromDate, 'yyyy-MM-dd HH:mm:ss')).toEqual(
        actualFromDate
      );
      expect(format(expectedToDate, 'yyyy-MM-dd HH:mm:ss')).toEqual(
        actualToDate
      );
    });
  });

  it('displays nothing if expanded is false', async () => {
    props = { expanded: false };
    const { container } = createView();

    expect(container).toBeEmptyDOMElement();
  });
});
