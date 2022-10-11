type TokenType =
  | 'not'
  | 'and'
  | 'or'
  | 'number'
  | 'string'
  | 'compop'
  | 'openparen'
  | 'closeparen'
  | 'channel'
  | 'unaryop';

export interface Token {
  type: TokenType;
  value: string;
  displayValue?: string;
}

export const operators: Token[] = [
  {
    type: 'not',
    value: 'not',
  },
  {
    type: 'and',
    value: 'and',
  },
  {
    type: 'or',
    value: 'or',
  },
  {
    type: 'openparen',
    value: '(',
  },
  {
    type: 'closeparen',
    value: ')',
  },
  {
    type: 'compop',
    value: '=',
  },
  {
    type: 'compop',
    value: '!=',
  },
  {
    type: 'compop',
    value: '<=',
  },
  {
    type: 'compop',
    value: '>=',
  },
  {
    type: 'compop',
    value: '<',
  },
  {
    type: 'compop',
    value: '>',
  },
  {
    type: 'unaryop',
    value: 'is not null',
  },
  {
    type: 'unaryop',
    value: 'is null',
  },
];

/**
 * Converts an operator token into a MongoDB operator
 * @param opToken Operator token to convert
 * @returns string with the corresponding MongoDB operator
 */
const convertOperator = (opToken: Token): string => {
  if (opToken.type !== 'compop' && opToken.type !== 'unaryop') {
    throw new ParserError(`Error converting operator ${opToken.value}`);
  } else {
    if (opToken.value === '=' || opToken.value === 'is null') {
      return 'eq';
    }
    if (opToken.value === '!=' || opToken.value === 'is not null') {
      return 'ne';
    }
    if (opToken.value === '<') {
      return 'lt';
    }
    if (opToken.value === '>') {
      return 'gt';
    }
    if (opToken.value === '<=') {
      return 'lte';
    }
    if (opToken.value === '>=') {
      return 'gte';
    } else {
      throw new ParserError(`Error converting operator ${opToken.value}`);
    }
  }
};

/**
 * Converts the short name of a channel into the DB name
 * @param channel channel to convert
 * @returns Database channel name
 * @example
 * // returns metadata.timestamp
 * convertChannel("timestamp")
 * @example
 * // returns channels.CHANNEL_1.data
 * convertChannel("CHANNEL_1")
 */
const convertChannel = (channel: string): string => {
  if (
    ['timestamp', 'shotnum', 'activeArea', 'activeExperiment'].includes(channel)
  ) {
    return `metadata.${channel}`;
  } else {
    return `channels.${channel}.data`;
  }
};

export class ParserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParserError';
  }
}

/** Class representing a stream of tokens, which keeps track of where in the array we've processed up to */
class Input {
  tokens: Token[];
  pos: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.pos = 0;
  }

  /**
   * Returns the token at the current position relative to the given offset
   * @param off the offset to look at
   * @returns a Token if it's within the range of the stream otherwise null
   */
  public peek(off: number): Token | null {
    const n = this.pos + off;
    if (n >= 0 && n < this.tokens.length) {
      return this.tokens[this.pos + off];
    } else {
      return null;
    }
  }

  /**
   * Returns the next token in the stream and moves the position forward.
   * @param types an array of `TokenTypes` check the current token against
   * @returns The next token in the stream or null if it's the end of the stream
   * @throws {ParserError} if the token does not match the `types` param or if we attempt to read beyond the end of the stream
   */
  public consume(types?: TokenType[]): Token | null {
    if (types) {
      if (this.pos < this.tokens.length) {
        if (types.includes(this.tokens[this.pos].type)) {
          return this.tokens[this.pos++];
        } else {
          throw new ParserError(
            `Expected token from types [${types}] at token ${
              this.peek(0)?.value
            }` // TODO: better error message?
          );
        }
      } else {
        throw new ParserError(`Missing token at end. Expected: ${types}`);
      }
    } else {
      if (this.pos < this.tokens.length) {
        return this.tokens[this.pos++];
      } else if (this.pos === this.tokens.length) {
        return null;
      } else {
        throw new ParserError('Attempt to read beyond end');
      }
    }
  }
}

/**
 * Class representing a predicate e.g. `CHANNEL_1 < 1` or `activeExperiment is not null`
 *
 * Predicate ::= channel COMPOP param | channel UNARYOP
 */
class Predicate {
  param1: string | number | undefined;
  param2: string | number | undefined;
  op: Token | undefined;

  /**
   * @param input `Input` stream to use
   * @throws {ParserError} if the predicate has invalid syntax e.g. number on LHS, no operator etc.
   */
  constructor(input: Input) {
    let token = input.peek(0);
    if (token !== null) {
      if (token.type === 'channel') {
        this.param1 = convertChannel(token.value);
        input.consume();
      } else if (token.type === 'string') {
        throw new ParserError(
          `Unexpected string on left hand side of expression: ${token.value}`
        );
      } else if (token.type === 'number') {
        throw new ParserError(
          `Unexpected number on left hand side of expression: ${token.value}`
        );
      } else {
        throw new ParserError(`Unexpected: ${token.value}`);
      }
    } else {
      throw new ParserError('Missing operand');
    }
    this.op = input.consume(['compop', 'unaryop']) as Token;
    if (this.op.type === 'compop') {
      token = input.peek(0);
      if (token !== null) {
        if (token.type === 'channel') {
          this.param2 = convertChannel(token.value);
          input.consume();
        } else if (token.type === 'string') {
          // remove quotes
          this.param2 = token.value.replaceAll('"', '').replaceAll("'", '');
          input.consume();
        } else if (token.type === 'number') {
          this.param2 = Number(token.value);
          input.consume();
        } else {
          throw new ParserError(`Unexpected: ${token.value}`);
        }
      } else {
        throw new ParserError('Missing operand');
      }
    }
  }

  public toString(): string {
    let s = '';
    if (this.param1 && this.op && this.op.type === 'compop' && this.param2) {
      const param2 =
        typeof this.param2 === 'string' ? `"${this.param2}"` : this.param2;
      s = `{"${this.param1}":{"$${convertOperator(this.op)}":${param2}}}`;
    } else if (this.param1 && this.op && this.op.type === 'unaryop') {
      s = `{"${this.param1}":{"$${convertOperator(this.op)}":null}}`;
    }
    return s;
  }
}

/**
 * Class representing a potential NOT expression or parenthesis
 *
 * BooleanFactor ::= ("NOT")? Predicate | ( "(" SearchCondition ")" )
 */
class BooleanFactor {
  not = false;
  predicate: Predicate | undefined;
  searchCondition: SearchCondition | undefined;

  /**
   * @param input `Input` stream to use
   * @throws {ParserError} if the expression has invalid syntax
   */
  constructor(input: Input) {
    let token = input.peek(0);
    if (token == null) {
      throw new ParserError('Expression incomplete');
    }
    if (token.type === 'not') {
      input.consume();
      this.not = true;
    }
    token = input.peek(0);
    if (token == null) {
      throw new ParserError('Expression incomplete');
    }
    if (token.type === 'openparen') {
      input.consume();
      this.searchCondition = new SearchCondition(input);
      input.consume(['closeparen']);
    } else {
      this.predicate = new Predicate(input);
    }
  }

  public toString(): string {
    let s = '';
    if (this.not) {
      s += '{"$not":';
    }
    if (this.predicate) {
      s += this.predicate;
    }
    if (this.searchCondition) {
      s += this.searchCondition;
    }
    if (this.not) {
      s += '}';
    }
    return s;
  }
}

/**
 * Class representing a potential AND expression
 *
 * BooleanTerm ::= BooleanFactor ( "AND" BooleanFactor ) *
 */
class BooleanTerm {
  factors: BooleanFactor[] = [];

  /**
   * @param input `Input` stream to use
   * @throws {ParserError} if the expression has invalid syntax
   */
  constructor(input: Input) {
    this.factors.push(new BooleanFactor(input));
    let token = null;
    while ((token = input.peek(0)) !== null) {
      if (token.type === 'and') {
        input.consume();
        this.factors.push(new BooleanFactor(input));
      } else {
        return;
      }
    }
  }

  public toString(): string {
    let s = '';
    if (this.factors.length === 0) {
      // do nothing - should never happen due to error checking
    } else if (this.factors.length === 1) {
      s += this.factors[0];
    } else {
      s += '{"$and":[';
      this.factors.forEach((f) => (s += f + ','));
      s = s.slice(0, -1);
      s += ']}';
    }
    return s;
  }
}

/**
 * Class representing a potential OR expression
 *
 * SearchCondition ::= BooleanTerm ( "OR" BooleanTerm ) *
 */
class SearchCondition {
  booleanTerms: BooleanTerm[] = [];

  /**
   * @param input `Input` stream to use
   * @throws {ParserError} if the expression has invalid syntax
   */
  constructor(input: Input) {
    this.booleanTerms.push(new BooleanTerm(input));
    let token = null;
    while ((token = input.peek(0)) !== null) {
      if (token.type === 'or') {
        input.consume();
        this.booleanTerms.push(new BooleanTerm(input));
      } else {
        return;
      }
    }
  }

  public toString(): string {
    let s = '';
    if (this.booleanTerms.length === 0) {
      // do nothing - should never happen due to error checking
    } else if (this.booleanTerms.length === 1) {
      s += this.booleanTerms[0];
    } else {
      s += '{"$or":[';
      this.booleanTerms.forEach((t) => (s += t + ','));
      s = s.slice(0, -1);
      s += ']}';
    }
    return s;
  }
}

/**
 * Parses a list of tokens into a MongoDB style filter we can pass to the backend
 * @param tokens array of tokens repesenting the filter
 * @returns a MongoDB style filter which can be passed as a `condition` to the backend
 * @throws {ParserError} Will throw an error with a descriptive message if the filter cannot be parsed
 */
export const parseFilter = (tokens: Token[]): string | never => {
  const input = new Input(tokens);
  const searchCondition = new SearchCondition(input);
  return searchCondition.toString();
};
