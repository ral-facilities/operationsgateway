import { format, isValid } from 'date-fns';
import React from 'react';
import { convertApiTimestampToDate } from '../../api/api';
import { RoundingConfigType } from '../../settings';

export const roundNumber = (
  num: number,
  roundingConfig: RoundingConfigType,
  channelPrecision: number | undefined,
  channelNotation: 'scientific' | 'normal' | undefined
): string => {
  const {
    precision: roundingConfigPrecision,
    scientificNotationThresholds,
    precisionMeaning,
    source,
    trimTrailingZeros,
  } = roundingConfig;

  let precision = -1;

  if (source === 'column_definitions') {
    if (typeof channelPrecision === 'undefined') {
      if (typeof roundingConfigPrecision !== 'undefined') {
        precision = roundingConfigPrecision;
      } else {
        return num.toString();
      }
    } else {
      precision = channelPrecision;
    }
  } else if (roundingConfigPrecision) {
    precision = roundingConfigPrecision;
  }

  if (
    precision < 0 ||
    (roundingConfig.precisionMeaning !== 'decimal_places' && precision === 0)
  )
    return num.toString();

  let notation: 'scientific' | 'normal' | undefined = undefined;
  if (source === 'value') {
    notation = 'normal';
    if (typeof scientificNotationThresholds !== 'undefined') {
      const { large, small } = scientificNotationThresholds;
      if (typeof large !== 'undefined') {
        const { upper, lower } = large;
        if (typeof upper === 'undefined' || num > upper)
          notation = 'scientific';
        else if (typeof lower === 'undefined' || num < lower)
          notation = 'scientific';
      }
      if (typeof small !== 'undefined') {
        const { upper, lower } = small;
        if (typeof upper === 'undefined' || (num > 0 && num < upper))
          notation = 'scientific';
        else if (typeof lower === 'undefined' || (num < 0 && num > lower))
          notation = 'scientific';
      }
    }
  } else {
    notation = channelNotation;
  }

  let rounded = '';

  if (precisionMeaning === 'decimal_places') {
    rounded =
      notation === 'scientific'
        ? num.toExponential(precision)
        : num.toFixed(precision);
  } else {
    const roundedNum = num.toPrecision(precision);

    if (precisionMeaning === 'significant_figures') {
      rounded =
        notation === 'scientific'
          ? num.toExponential(precision - 1)
          : // toPrecision returns scientific notation if exponent > precision aka 5123 to precision 2 is 5.2e4 rather than 5200, so cast to number and then recast to string
            roundedNum.includes('e')
            ? Number(roundedNum).toString()
            : roundedNum;
    } else {
      /*
      For EPAC precision meaning:
      In normal mode, do not round to the left of the decimal point,
      even if the number of significant figures says that you should.
      For example, 916.3 with a specified precision of 2 sig figs should be
      displayed as 9.2e2 or 916 in scientific or normal mode respectively.
      */

      // count number of digits before decimal point (and ignore minus sign)
      const [integerPart] = num.toString().replace('-', '').split('.');
      const intDigits = integerPart.length;

      const decimalPlaces = intDigits >= precision ? 0 : precision - intDigits;
      rounded =
        notation === 'scientific'
          ? num.toExponential(precision - 1)
          : decimalPlaces > 0
            ? roundedNum
            : integerPart;
    }
  }
  if (trimTrailingZeros) {
    if (notation === 'scientific') return Number(rounded).toExponential();
    else return Number(rounded).toString();
  }
  return rounded;
};

export const Base64ImageThumbnail = React.forwardRef(
  (
    props: {
      base64Data: string | undefined;
    } & React.ComponentPropsWithRef<'img'>,
    ref: React.ForwardedRef<HTMLImageElement>
  ) => {
    const { base64Data, alt, style, ...rest } = props;
    return base64Data ? (
      <img
        {...rest}
        ref={ref}
        src={`data:image/jpeg;base64,${base64Data}`}
        alt={alt}
        style={{ ...style, border: '1px solid #000000' }}
      />
    ) : null;
  }
);
Base64ImageThumbnail.displayName = 'Base64ImageThumbnail';

export const renderTimestamp = (serverTimestamp: string) => {
  const date = convertApiTimestampToDate(serverTimestamp);
  if (isValid(date)) {
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  } else {
    // if the date is invalid, return the "Invalid Date" string
    return date.toString();
  }
};
