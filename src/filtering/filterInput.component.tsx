import { Autocomplete, TextField } from '@mui/material';
import React from 'react';

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
}

const operators: Token[] = [
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

export class Input {
  tokens: Token[];
  pos: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.pos = 0;
  }

  public peek(off: number): Token | null {
    const n = this.pos + off;
    if (n >= 0 && n < this.tokens.length) {
      return this.tokens[this.pos + off];
    } else {
      return null;
    }
  }

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

// Predicate ::= value COMPOP value | value UNARYOP
class Predicate {
  param1: string | number | undefined;
  param2: string | number | undefined;
  op: Token | undefined;
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
          `Unexpected string on left hand side of expression: ${token.value}`
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
          this.param2 = token.value;
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

// BooleanFactor ::= ("NOT")? Predicate | ( "(" SearchCondition ")" )
class BooleanFactor {
  not = false;
  predicate: Predicate | undefined;
  searchCondition: SearchCondition | undefined;
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

// BooleanTerm ::= BooleanFactor ( "AND" BooleanFactor ) *
class BooleanTerm {
  factors: BooleanFactor[] = [];
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

// SearchCondition ::= BooleanTerm ( "OR" BooleanTerm ) *
export class SearchCondition {
  booleanTerms: BooleanTerm[] = [];
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

interface FilterInputProps {
  channels: string[];
  value: Token[];
  setValue: (value: Token[]) => void;
  error: string;
  setError: (error: string) => void;
}

const FilterInput = (props: FilterInputProps) => {
  const { channels, value, setValue, error, setError } = props;
  const options = React.useMemo(() => {
    const channelTokens: Token[] = channels.map((c) => ({
      type: 'channel',
      value: c,
    }));
    return [...channelTokens, ...operators];
  }, [channels]);
  const [inputValue, setInputValue] = React.useState<string>('');

  const input = React.useMemo(() => {
    const input = new Input(value);
    console.log('input', input);
    return input;
  }, [value]);

  React.useEffect(() => {
    try {
      const searchCondition = new SearchCondition(input);
      console.log('searchCondition', searchCondition);
      setError('');
    } catch (e) {
      if (e instanceof ParserError) setError(e.message);
    }
  }, [input, setError]);

  return (
    <Autocomplete
      multiple
      id="tags-outlined"
      options={options}
      freeSolo
      autoHighlight
      size="small"
      fullWidth
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      value={value}
      getOptionLabel={(option: Token | string) =>
        typeof option !== 'string' ? option.value : option
      }
      onChange={(
        event: unknown,
        newValue: (string | Token)[],
        reason: string
      ) => {
        // createOption implies a value which is not in options so either
        // a number, a string (surrounded by quotes) or we should reject
        if (reason === 'createOption') {
          // newTerm is a string not a Token so use that fact to find it
          const newTerm = newValue.find((v) => typeof v === 'string');
          if (newTerm && typeof newTerm === 'string') {
            const newTermIndex = newValue.indexOf(newTerm);
            // new term is a valid number so allow it to be added
            if (!Number.isNaN(Number(newTerm))) {
              newValue[newTermIndex] = { type: 'number', value: newTerm };
              setValue(newValue as Token[]);
            } // new term is a string specified by either single or double quotes so allow it
            else if (
              (newTerm[0] === '"' && newTerm[newTerm.length - 1] === '"') ||
              (newTerm[0] === "'" && newTerm[newTerm.length - 1] === "'")
            ) {
              newValue[newTermIndex] = { type: 'string', value: newTerm };
              setValue(newValue as Token[]);
            } else {
              // otherwise don't add the new term & leave it in textbox
              setInputValue(newTerm);
            }
          }
        } else {
          setValue(newValue as Token[]);
        }
      }}
      // this is need to allow user to repeatedly select the same tag
      isOptionEqualToValue={(option, value) => false}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Filter"
          error={error.length > 0}
          helperText={error}
        />
      )}
    />
  );
};

export default FilterInput;
