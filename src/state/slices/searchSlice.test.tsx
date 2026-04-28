import SearchReducer, {
  getDefaultMaxShot,
  initialiseDefaultMaxShots,
  initialStateFunc,
  selectDateRangeInLocalTime,
} from './searchSlice';

describe('Search slice tests', () => {
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

  it('initialiseDefaultMaxShots takes max shot config and extracts the default max shot value', () => {
    expect(state.search.searchParams.maxShots).toBe(50);

    const updatedState = SearchReducer(
      state.search,
      initialiseDefaultMaxShots([
        { value: 100, default: true },
        { value: 'Unlimited' },
      ])
    );

    expect(updatedState.searchParams.maxShots).toBe(100);
  });
});

describe('getDefaultMaxShot', () => {
  it('can get numeric default max shot', () => {
    expect(
      getDefaultMaxShot([
        { value: 100 },
        { value: 500, default: true },
        { value: 'Unlimited' },
      ])
    ).toBe(500);
  });
  it('converts Unlimited max shot to Infinity', () => {
    expect(
      getDefaultMaxShot([
        { value: 100 },
        { value: 500 },
        { value: 'Unlimited', default: true },
      ])
    ).toBe(Infinity);
  });
  it('returns first max shot if no default specified', () => {
    expect(
      getDefaultMaxShot([
        { value: 100 },
        { value: 500 },
        { value: 'Unlimited' },
      ])
    ).toBe(100);
  });
});
