import { format, isValid, parseISO } from 'date-fns';

export const roundNumber = (
  num: number,
  precision: number,
  notation: 'scientific' | 'normal' | undefined
): string => {
  /*
  In normal mode, do not round to the left of the decimal point,
  even if the number of significant figures says that you should.
  For example, 916.3 with a specified precision of 2 sig figs should be
  displayed as 9.2e2 or 916 in scientific or normal mode respectively.
  */

  if (precision <= 0) return num.toString();

  // count number of digits before decimal point (and ignore minus sign)
  const [integerPart] = num.toString().replace('-', '').split('.');
  const intDigits = integerPart.length;

  const decimalPlaces = intDigits >= precision ? 0 : precision - intDigits;
  const rounded =
    notation === 'scientific'
      ? num.toExponential(precision - 1)
      : num.toFixed(decimalPlaces);

  return rounded;
};

export const renderImage = (base64Data: string, altText: string) => (
  <img
    src={`data:image/jpeg;base64,${base64Data}`}
    alt={altText}
    style={{ border: '1px solid #000000' }}
  />
);

export const renderTimestamp = (serverTimestamp: string) => {
  const date = parseISO(serverTimestamp);
  if (isValid(date)) {
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  } else {
    // if the date is invalid, return the "Invalid Date" string
    return date.toString();
  }
};
