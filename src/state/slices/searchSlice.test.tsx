import { formatDateTimeForApi } from './searchSlice';

describe('formatDateTimeForApi', () => {
  it('returns a correctly formatted string', () => {
    const testDate = new Date('2022-01-01 00:00:00');
    const result = formatDateTimeForApi(testDate);
    expect(result).toEqual('2022-01-01T00:00:00');
  });
});
