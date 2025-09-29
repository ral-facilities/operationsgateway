import { convertApiTimestampToDate, formatDateTimeForApi } from './api';

describe('API timestamp conversion functions', () => {
  beforeEach(() => {
    vi.stubEnv('TZ', 'Etc/GMT-1'); // POSIX timezone so this is "opposite" so this is UTC+1 aka BST
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('formatDateTimeForApi', () => {
    it('returns a correctly formatted string', () => {
      const testDate = new Date('2022-01-01 01:00:00');
      const result = formatDateTimeForApi(testDate);
      expect(result).toEqual('2022-01-01T00:00:00');
    });
  });

  describe('convertApiTimestampToDate', () => {
    it('returns a local date', () => {
      const result = convertApiTimestampToDate('2022-01-01T00:00:00');
      expect(result).toEqual(new Date('2022-01-01 01:00:00'));
    });
  });
});
