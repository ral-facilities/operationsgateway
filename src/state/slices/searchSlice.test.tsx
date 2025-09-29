import { initialStateFunc, selectDateRangeInLocalTime } from './searchSlice';

describe('Selectors', () => {
  let state: { search: ReturnType<typeof initialStateFunc> };

  beforeEach(() => {
    state = { search: initialStateFunc() };
    vi.stubEnv('TZ', 'Etc/GMT-1'); // POSIX timezone so this is "opposite" so this is UTC+1 aka BST
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('selectDateRangeInLocalTime converts API string to local JS date objects', () => {
    state = {
      search: {
        searchParams: {
          ...state.search.searchParams,
          dateRange: {
            fromDate: '2025-09-21T10:00:00',
            toDate: '2025-09-21T11:00:00',
          },
        },
      },
    };

    expect(selectDateRangeInLocalTime(state)).toEqual({
      fromDate: new Date('2025-09-21 11:00:00'),
      toDate: new Date('2025-09-21 12:00:00'),
    });
  });
});
