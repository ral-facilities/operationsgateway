import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
} from '@mui/material';
import { FunctionOperator } from '../app.types';
import { Body, Heading } from '../filtering/filterDialogue.component';

export interface FunctionsHelpProps {
  data: FunctionOperator[];
}

interface Categories {
  'Mathematical Symbols': FunctionOperator[];
  'Statistical Functions': FunctionOperator[];
  'Exponential And Logarithmic Functions': FunctionOperator[];
  'Waveform Analysis': FunctionOperator[];
  'Image Analysis': FunctionOperator[];
}

function categoriseSymbols(symbols: FunctionOperator[]) {
  const categories: Categories = {
    'Mathematical Symbols': [],
    'Statistical Functions': [],
    'Exponential And Logarithmic Functions': [],
    'Waveform Analysis': [],
    'Image Analysis': [],
  };

  symbols.forEach((symbol) => {
    switch (symbol.symbol) {
      case '+':
      case '-':
      case '*':
      case '/':
      case '**':
      case '(':
      case ')':
        categories['Mathematical Symbols'].push(symbol);
        break;
      case 'mean':
      case 'max':
      case 'min':
        categories['Statistical Functions'].push(symbol);
        break;
      case 'exp':
      case 'log':
        categories['Exponential And Logarithmic Functions'].push(symbol);
        break;
      case 'background':
      case 'centre':
      case 'falling':
      case 'fwhm':
      case 'integrate':
      case 'rising':
        categories['Waveform Analysis'].push(symbol);
        break;
      case 'centroid_x':
      case 'centroid_y':
      case 'fmhw_x':
      case 'fmhw_y':
        categories['Image Analysis'].push(symbol);
        break;
      default:
        break;
    }
  });

  return categories;
}

const FunctionsHelp = (props: FunctionsHelpProps) => {
  const { data } = props;

  const formattedData = categoriseSymbols(data);
  return (
    <>
      <Heading>Functions help</Heading>
      <Body>
        In the box, start typing data channel names, numbers, mathematical
        functions, mathematical symbols such as{' '}
        <Chip
          label="+"
          size="small"
          sx={{
            fontSize: '0.8125rem',
            mx: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
          }}
        />{' '}
        and{' '}
        <Chip
          label="integrate"
          size="small"
          sx={{
            fontSize: '0.8125rem',
            mx: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
          }}
        />
        . The Wizard will suggest suitable options and indicate using a grey box
        when each item has been recognised.
      </Body>
      <Heading>Functions and operators included </Heading>
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {Object.entries(formattedData).map(([key, values], index) => (
              <TableRow key={index}>
                <TableCell>{key}</TableCell>
                <TableCell>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {values.map((value: FunctionOperator) => {
                      return (
                        <Tooltip
                          title={value.details || ''}
                          placement="top"
                          key={value.symbol}
                        >
                          <Chip
                            label={value.symbol}
                            size="small"
                            sx={{
                              fontSize: '0.8125rem',
                              backgroundColor: 'rgba(0, 0, 0, 0.08)',
                            }}
                          />
                        </Tooltip>
                      );
                    })}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default FunctionsHelp;
