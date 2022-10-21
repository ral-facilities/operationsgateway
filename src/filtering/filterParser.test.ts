import { operators, parseFilter, Token } from './filterParser';

describe('Filter parser', () => {
  const timestampToken: Token = {
    type: 'channel',
    value: 'timestamp',
    label: 'Time',
  };
  const channelToken: Token = {
    type: 'channel',
    value: 'CHANNEL_1',
    label: 'Channel 1',
  };
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const ltToken: Token = operators.find((t) => t.value === '<')!;
  const eqToken: Token = operators.find((t) => t.value === '=')!;
  const neqToken: Token = operators.find((t) => t.value === '!=')!;
  const gtToken: Token = operators.find((t) => t.value === '>')!;
  const lteToken: Token = operators.find((t) => t.value === '<=')!;
  const gteToken: Token = operators.find((t) => t.value === '>=')!;
  const numberToken: Token = { type: 'number', value: '1', label: '1' };
  const stringToken: Token = {
    type: 'string',
    value: '"test"',
    label: '"test"',
  };
  const isNullToken: Token = operators.find((t) => t.value === 'is null')!;
  const isNotNullToken: Token = operators.find(
    (t) => t.value === 'is not null'
  )!;
  const notToken: Token = operators.find((t) => t.value === 'not')!;
  const openParenToken: Token = operators.find((t) => t.value === '(')!;
  const closeParenToken: Token = operators.find((t) => t.value === ')')!;
  const andToken: Token = operators.find((t) => t.value === 'and')!;
  const orToken: Token = operators.find((t) => t.value === 'or')!;
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  it('can parse a comparison operation', () => {
    expect(parseFilter([timestampToken, ltToken, numberToken])).toEqual(
      '{"metadata.timestamp":{"$lt":1}}'
    );
  });

  it('can parse a unary operation', () => {
    expect(parseFilter([channelToken, isNullToken])).toEqual(
      '{"channels.CHANNEL_1.data":{"$eq":null}}'
    );
  });

  it('throws error if non-channel on LHS of predicate', () => {
    expect(() => {
      parseFilter([stringToken, isNullToken]);
    }).toThrowError(
      'Unexpected string on left hand side of expression: "test"'
    );

    expect(() => {
      parseFilter([numberToken, ltToken, timestampToken]);
    }).toThrowError('Unexpected number on left hand side of expression: 1');

    expect(() => {
      parseFilter([isNullToken, ltToken, timestampToken]);
    }).toThrowError('Unexpected: is null');
  });

  it('throws error if a predicate is incomplete', () => {
    expect(() => {
      parseFilter([timestampToken]);
    }).toThrowError('Missing token at end. Expected: compop,unaryop');

    expect(() => {
      parseFilter([timestampToken, channelToken]);
    }).toThrowError(
      'Expected token from types [compop,unaryop] at token CHANNEL_1'
    );

    expect(() => {
      parseFilter([timestampToken, ltToken]);
    }).toThrowError('Missing operand');
  });

  it('throws error if an invalid operator is supplied', () => {
    expect(() => {
      parseFilter([
        timestampToken,
        { type: 'compop', value: 'INVALID', label: 'INVALID' },
        numberToken,
      ]);
    }).toThrowError('Error converting operator INVALID');
  });

  it('throws error if RHS of a comparison predicate is not valid', () => {
    expect(() => {
      parseFilter([timestampToken, ltToken, ltToken]);
    }).toThrowError('Unexpected: <');
  });

  it('can parse a not expression', () => {
    expect(
      parseFilter([notToken, timestampToken, eqToken, channelToken])
    ).toEqual(
      '{"metadata.timestamp":{"$not":{"$eq":"channels.CHANNEL_1.data"}}}'
    );

    expect(
      parseFilter([
        notToken,
        openParenToken,
        notToken,
        timestampToken,
        eqToken,
        channelToken,
        closeParenToken,
      ])
    ).toEqual('{"metadata.timestamp":{"$eq":"channels.CHANNEL_1.data"}}');
  });

  it('can parse an AND expression', () => {
    expect(
      parseFilter([
        timestampToken,
        gtToken,
        numberToken,
        andToken,
        channelToken,
        lteToken,
        numberToken,
      ])
    ).toEqual(
      '{"$and":[{"metadata.timestamp":{"$gt":1}},{"channels.CHANNEL_1.data":{"$lte":1}}]}'
    );
  });

  it('can parse an OR expression', () => {
    expect(
      parseFilter([
        timestampToken,
        gteToken,
        numberToken,
        orToken,
        channelToken,
        neqToken,
        stringToken,
      ])
    ).toEqual(
      '{"$or":[{"metadata.timestamp":{"$gte":1}},{"channels.CHANNEL_1.data":{"$ne":"test"}}]}'
    );
  });

  it('can parse an expression with mixed AND and OR', () => {
    expect(
      parseFilter([
        timestampToken,
        gteToken,
        numberToken,
        orToken,
        channelToken,
        neqToken,
        stringToken,
        andToken,
        channelToken,
        isNotNullToken,
      ])
    ).toEqual(
      '{"$or":[{"metadata.timestamp":{"$gte":1}},{"$and":[{"channels.CHANNEL_1.data":{"$ne":"test"}},{"channels.CHANNEL_1.data":{"$ne":null}}]}]}'
    );
  });

  it('can parse an expression wrapped with parenthesis and it changes the order of operations', () => {
    expect(
      parseFilter([
        openParenToken,
        timestampToken,
        gteToken,
        numberToken,
        orToken,
        channelToken,
        neqToken,
        stringToken,
        closeParenToken,
        andToken,
        channelToken,
        isNotNullToken,
      ])
    ).toEqual(
      '{"$and":[{"$or":[{"metadata.timestamp":{"$gte":1}},{"channels.CHANNEL_1.data":{"$ne":"test"}}]},{"channels.CHANNEL_1.data":{"$ne":null}}]}'
    );
  });

  it('throws an error if the expression is incomplete', () => {
    expect(() => {
      parseFilter([notToken]);
    }).toThrowError('Expression incomplete');
  });

  it('throws an error if there is a missing closing parenthesis', () => {
    expect(() => {
      parseFilter([openParenToken, timestampToken, isNotNullToken]);
    }).toThrowError('Missing token at end. Expected: closeparen');
  });

  it('returns empty string when given empty array', () => {
    expect(parseFilter([])).toEqual('');
  });

  it('can parse a not expression negating ORs and ANDs', () => {
    expect(
      parseFilter([
        notToken,
        openParenToken,
        timestampToken,
        gtToken,
        numberToken,
        andToken,
        notToken,
        channelToken,
        lteToken,
        numberToken,
        closeParenToken,
      ])
    ).toEqual(
      '{"$or":[{"metadata.timestamp":{"$not":{"$gt":1}}},{"channels.CHANNEL_1.data":{"$lte":1}}]}'
    );

    expect(
      parseFilter([
        notToken,
        openParenToken,
        notToken,
        timestampToken,
        gtToken,
        numberToken,
        orToken,
        channelToken,
        lteToken,
        numberToken,
        closeParenToken,
      ])
    ).toEqual(
      '{"$and":[{"metadata.timestamp":{"$gt":1}},{"channels.CHANNEL_1.data":{"$not":{"$lte":1}}}]}'
    );
  });
});
