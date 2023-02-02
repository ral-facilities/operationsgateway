import { roundNumber } from './cellContentRenderers';

describe('cell content renderers', () => {
  describe('roundNumber', () => {
    it('rounds 916.3 to 916 when significantFigures is 2 in normal mode', () => {
      const result = roundNumber(916.3, 2, 'normal');
      expect(result).toBe('916');
    });

    it('rounds 916.3 to 9.2e+2 when significantFigures is 2 in scientific mode', () => {
      const result = roundNumber(916.3, 2, 'scientific');
      expect(result).toBe('9.2e+2');
    });

    it('rounds 916.3 to 916 when significantFigures is 1 in normal mode', () => {
      const result = roundNumber(916.3, 1, undefined);
      expect(result).toBe('916');
    });

    it('rounds 916.3 to 9e+2 when significantFigures is 1 in scientific mode', () => {
      const result = roundNumber(916.3, 1, 'scientific');
      expect(result).toBe('9e+2');
    });

    it('rounds 916.3 to 916 when significantFigures is 3 in normal mode', () => {
      const result = roundNumber(916.3, 3, 'normal');
      expect(result).toBe('916');
    });

    it('rounds 916.3 to 9.16e+2 when significantFigures is 3 in scientific mode', () => {
      const result = roundNumber(916.3, 3, 'scientific');
      expect(result).toBe('9.16e+2');
    });

    it('rounds 916.3 to 916.3 when significantFigures is 4 in normal mode', () => {
      const result = roundNumber(916.3, 4, 'normal');
      expect(result).toBe('916.3');
    });

    it('rounds 916.3 to 9.163e+2 when significantFigures is 4 in scientific mode', () => {
      const result = roundNumber(916.3, 4, 'scientific');
      expect(result).toBe('9.163e+2');
    });

    it('rounds 916.3 to 916.30 when significantFigures is 5 in normal mode', () => {
      const result = roundNumber(916.3, 5, 'normal');
      expect(result).toBe('916.30');
    });

    it('rounds 916.3 to 9.1630e+2 when significantFigures is 5 in scientific mode', () => {
      const result = roundNumber(916.3, 5, 'scientific');
      expect(result).toBe('9.1630e+2');
    });

    it('handles significantFigures of 0 correctly in normal mode', () => {
      const result = roundNumber(916.3, 0, 'normal');
      expect(result).toBe('916.3');
    });

    it('handles significantFigures of 0 correctly in scientific mode', () => {
      const result = roundNumber(916.3, 0, 'scientific');
      expect(result).toBe('916.3');
    });

    it('handles negative number significantFigures correctly in normal mode', () => {
      const result = roundNumber(916.3, -1, 'normal');
      expect(result).toBe('916.3');
    });

    it('handles negative number significantFigures correctly in scientific mode', () => {
      const result = roundNumber(916.3, -1, 'scientific');
      expect(result).toBe('916.3');
    });
  });
});
