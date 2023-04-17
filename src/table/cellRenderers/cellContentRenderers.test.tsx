import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  TraceOrImageThumbnail,
  renderTimestamp,
  roundNumber,
} from './cellContentRenderers';

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

  describe('renderImage', () => {
    it('returns an img tag with the correct src and alt attributes', () => {
      const view = render(
        <TraceOrImageThumbnail base64Data="base64" alt="alt text" />
      );
      expect(view.asFragment()).toMatchInlineSnapshot(`
        <DocumentFragment>
          <img
            alt="alt text"
            src="data:image/jpeg;base64,base64"
            style="border: 1px solid #000000;"
          />
        </DocumentFragment>
      `);
    });

    it('returns null when src is undefined', () => {
      const view = render(
        <TraceOrImageThumbnail base64Data={undefined} alt="alt text" />
      );
      expect(view.asFragment()).toMatchInlineSnapshot(`<DocumentFragment />`);
    });

    it('can attach a onClick handler to the img', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(
        <TraceOrImageThumbnail
          base64Data="base64"
          alt="alt text"
          onClick={onClick}
        />
      );
      await user.click(screen.getByRole('img', { name: 'alt text' }));
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('renderTimestamp', () => {
    it('returns a timestamp string in the correct format', () => {
      const view = renderTimestamp('2023-02-01T10:31:43');
      expect(view).toEqual('2023-02-01 10:31:43');
    });

    it('returns Invalid Date if passed in string is not an ISO timestamp', () => {
      const view = renderTimestamp('TEST');
      expect(view).toEqual(new Date('TEST').toString());
    });
  });
});
