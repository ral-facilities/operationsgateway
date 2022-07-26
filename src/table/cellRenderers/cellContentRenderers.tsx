export const roundNumber = (
  num: number,
  significantFigures: number,
  scientificNotation: boolean
): string => {
  /*
  In normal mode, do not round to the left of the decimal point,
  even if the number of significant figures says that you should.
  For example, 916.3 with a specified precision of 2 sig figs should be
  displayed as 9.2e2 or 916 in scientific or normal mode respectively.
  */

  if (significantFigures <= 0) return num.toString();

  // count number of digits before decimal point (and ignore minus sign)
  const [integerPart] = num.toString().replace('-', '').split('.');
  const intDigits = integerPart.length;

  const decimalPlaces =
    intDigits >= significantFigures ? 0 : significantFigures - intDigits;
  const rounded = scientificNotation
    ? num.toExponential(significantFigures - 1)
    : num.toFixed(decimalPlaces);

  return rounded;
};
