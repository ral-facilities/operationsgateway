import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoundingConfigType } from '../../settings';
import {
  Base64ImageThumbnail,
  renderTimestamp,
  roundNumber,
} from './cellContentRenderers';

describe('cell content renderers', () => {
  describe('roundNumber', () => {
    let roundingConfig: RoundingConfigType = { source: 'column_definitions' };

    describe('column_definition source mode', () => {
      beforeEach(() => {
        roundingConfig = {
          source: 'column_definitions',
        };
      });

      describe('EPAC mode', () => {
        beforeEach(() => {
          roundingConfig.precisionMeaning = 'EPAC';
        });

        test.for([
          [916.3, 2, 'normal', '916'],
          [916.3, 2, 'scientific', '9.2e+2'],
          [916.3, 1, 'normal', '916'],
          [916.3, 1, 'scientific', '9e+2'],
          [916.3, 3, 'normal', '916'],
          [916.3, 3, 'scientific', '9.16e+2'],
          [916.3, 4, 'normal', '916.3'],
          [916.3, 4, 'scientific', '9.163e+2'],
          [916.3, 5, 'normal', '916.30'],
          [916.3, 5, 'scientific', '9.1630e+2'],
          [916.3, 0, 'normal', '916.3'],
          [916.3, 0, 'scientific', '916.3'],
          [916.3, -1, 'normal', '916.3'],
          [916.3, -1, 'scientific', '916.3'],
        ])(
          'rounding %d to %i significant figures in %s mode is %s',
          ([num, sigfigs, mode, expected]) => {
            const result = roundNumber(
              num as number,
              roundingConfig,
              sigfigs as number | undefined,
              mode as 'scientific' | 'normal'
            );
            expect(result).toBe(expected);
          }
        );
      });

      describe('decimal_places mode', () => {
        beforeEach(() => {
          roundingConfig.precisionMeaning = 'decimal_places';
          // test having a default precision
          roundingConfig.precision = 2;
        });

        test.for([
          [916.3, 2, 'normal', '916.30'],
          [916.3, 2, 'scientific', '9.16e+2'],
          [916.3, 1, 'normal', '916.3'],
          [916.3, 1, 'scientific', '9.2e+2'],
          [916.3, 0, 'normal', '916'],
          [916.3, 0, 'scientific', '9e+2'],
          [916.3, undefined, 'normal', '916.30'], // test we use the default precision
        ])(
          'rounding %d to %i significant figures in %s mode is %s',
          ([num, sigfigs, mode, expected]) => {
            const result = roundNumber(
              num as number,
              roundingConfig,
              sigfigs as number | undefined,
              mode as 'scientific' | 'normal'
            );
            expect(result).toBe(expected);
          }
        );
      });

      describe('significant_figures mode', () => {
        beforeEach(() => {
          roundingConfig.precisionMeaning = 'significant_figures';
          // test having no default precision
          roundingConfig.precision = undefined;
        });

        test.for([
          [916.3, 2, 'normal', '920'],
          [916.3, 2, 'scientific', '9.2e+2'],
          [916.3, 1, 'normal', '900'],
          [916.3, 1, 'scientific', '9e+2'],
          [916.3, 5, 'normal', '916.30'],
          [916.3, 5, 'scientific', '9.1630e+2'],
          [916.3, 0, 'normal', '916.3'],
          [916.3, undefined, 'normal', '916.3'],
        ])(
          'rounding %d to %i significant figures in %s mode is %s',
          ([num, sigfigs, mode, expected]) => {
            const result = roundNumber(
              num as number,
              roundingConfig,
              sigfigs as number | undefined,
              mode as 'scientific' | 'normal'
            );
            expect(result).toBe(expected);
          }
        );
      });
    });

    describe('value source mode', () => {
      test.for([
        [
          916.3,
          {
            source: 'value',
            precision: 2,
            precisionMeaning: 'EPAC',
          },
          '916',
        ],
        [
          916.3,
          {
            source: 'value',
            precision: 5,
            precisionMeaning: 'EPAC',
          },
          '916.30',
        ],
        [
          916.3,
          {
            source: 'value',
            precision: 2,
            precisionMeaning: 'significant_figures',
          },
          '920',
        ],
        [
          916.3,
          {
            source: 'value',
            precision: 5,
            precisionMeaning: 'significant_figures',
          },
          '916.30',
        ],
        [
          916.3,
          {
            source: 'value',
            precision: 2,
            precisionMeaning: 'decimal_places',
          },
          '916.30',
        ],
        [
          1e7,
          {
            source: 'value',
            precision: 2,
            scientificNotationThresholds: {
              large: { upper: 1e6, lower: -1e6 },
              small: { upper: 1e-3, lower: -1e-3 },
            },
            precisionMeaning: 'EPAC',
          },
          '1.0e+7',
        ],
        [
          -1e7,
          {
            source: 'value',
            precision: 2,
            scientificNotationThresholds: {
              large: { upper: 1e6, lower: -1e6 },
            },
            precisionMeaning: 'significant_figures',
          },
          '-1.0e+7',
        ],
        [
          1e-4,
          {
            source: 'value',
            precision: 2,
            scientificNotationThresholds: {
              small: { upper: 1e-3, lower: -1e-3 },
            },
            precisionMeaning: 'decimal_places',
          },
          '1.00e-4',
        ],
        [
          -1e-4,
          {
            source: 'value',
            precision: 2,
            scientificNotationThresholds: {
              small: { upper: 1e-3, lower: -1e-3 },
              large: { upper: 1e6, lower: -1e6 },
            },
            precisionMeaning: 'significant_figures',
          },
          '-1.0e-4',
        ],
        [
          916.3,
          {
            source: 'value',
            precision: undefined,
          },
          '916.3',
        ],
        [
          916.3,
          {
            source: 'value',
            precision: -1,
          },
          '916.3',
        ],
        [
          916.3,
          {
            source: 'value',
            precisionMeaning: 'significant_figures',
            precision: 0,
          },
          '916.3',
        ],
        [
          916.3,
          {
            source: 'value',
            precisionMeaning: 'decimal_places',
            precision: 6,
            trimTrailingZeros: true,
          },
          '916.3',
        ],
        [
          -1.35e7,
          {
            source: 'value',
            precision: 4,
            scientificNotationThresholds: {
              large: { upper: 1e6, lower: -1e6 },
            },
            precisionMeaning: 'decimal_places',
            trimTrailingZeros: true,
          },
          '-1.35e+7',
        ],
      ])(
        'rounding %d to with %o rounding config is %s',
        ([num, roundingConfig, expected]) => {
          const result = roundNumber(
            num as number,
            roundingConfig as RoundingConfigType,
            undefined,
            undefined
          );
          expect(result).toBe(expected);
        }
      );
    });
  });

  describe('renderImage', () => {
    it('returns an img tag with the correct src and alt attributes', () => {
      const view = render(
        <Base64ImageThumbnail base64Data="base64" alt="alt text" />
      );
      expect(view.asFragment()).toMatchInlineSnapshot(`
        <DocumentFragment>
          <img
            alt="alt text"
            src="data:image/jpeg;base64,base64"
            style="border: 1px solid rgb(0, 0, 0);"
          />
        </DocumentFragment>
      `);
    });

    it('returns null when src is undefined', () => {
      const view = render(
        <Base64ImageThumbnail base64Data={undefined} alt="alt text" />
      );
      expect(view.asFragment()).toMatchInlineSnapshot(`<DocumentFragment />`);
    });

    it('can attach a onClick handler to the img', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Base64ImageThumbnail
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
