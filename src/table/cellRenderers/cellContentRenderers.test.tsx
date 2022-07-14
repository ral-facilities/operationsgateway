import { roundNumber } from './cellContentRenderers';

describe('cell content renderers', () => {
  describe('roundNumber', () => {
    it('rounds 916.3 to 916 when sf is 2 in normal mode', () => {
      const result = roundNumber(916.3, 2, false);
      expect(result).toBe('916');
    });

    it('rounds 916.3 to 9.2e+2 when sf is 2 in scientific mode', () => {
      const result = roundNumber(916.3, 2, true);
      expect(result).toBe('9.2e+2');
    });

    it('rounds 916.3 to 916 when sf is 1 in normal mode', () => {
      const result = roundNumber(916.3, 1, false);
      expect(result).toBe('916');
    });

    it('rounds 916.3 to 9e+2 when sf is 1 in scientific mode', () => {
      const result = roundNumber(916.3, 1, true);
      expect(result).toBe('9e+2');
    });

    it('rounds 916.3 to 916 when sf is 3 in normal mode', () => {
      const result = roundNumber(916.3, 3, false);
      expect(result).toBe('916');
    });

    it('rounds 916.3 to 9.16e+2 when sf is 3 in scientific mode', () => {
      const result = roundNumber(916.3, 3, true);
      expect(result).toBe('9.16e+2');
    });

    it('rounds 916.3 to 916.3 when sf is 4 in normal mode', () => {
      const result = roundNumber(916.3, 4, false);
      expect(result).toBe('916.3');
    });

    it('rounds 916.3 to 9.16e+2 when sf is 4 in scientific mode', () => {
      const result = roundNumber(916.3, 4, true);
      expect(result).toBe('9.163e+2');
    });

    it('rounds 916.3 to 916.30 when sf is 5 in normal mode', () => {
      const result = roundNumber(916.3, 5, false);
      expect(result).toBe('916.30');
    });

    it('rounds 916.3 to 9.160e+2 when sf is 5 in scientific mode', () => {
      const result = roundNumber(916.3, 5, true);
      expect(result).toBe('9.1630e+2');
    });

    it('handles sf of 0 correctly in normal mode', () => {
      const result = roundNumber(916.3, 0, false);
      expect(result).toBe('Invalid significant figure');
    });

    it('handles sf of 0 correctly in scientific mode', () => {
      const result = roundNumber(916.3, 0, true);
      expect(result).toBe('Invalid significant figure');
    });

    it('handles negative number sf correctly in normal mode', () => {
      const result = roundNumber(916.3, -1, false);
      expect(result).toBe('Invalid significant figure');
    });

    it('handles negative number sf correctly in scientific mode', () => {
      const result = roundNumber(916.3, -1, true);
      expect(result).toBe('Invalid significant figure');
    });
  });
});
