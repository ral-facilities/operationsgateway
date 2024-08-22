import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
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
        functions, mathematical symbols such as {'+'} and {'integrate'}. The
        Wizard will suggest suitable options and indicate using a grey box when
        each item has been recognised.
      </Body>
      <Heading>Functions and operators included </Heading>
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {Object.entries(formattedData).map(([key, values], index) => (
              <TableRow key={index}>
                <TableCell>{key}</TableCell>
                <TableCell>
                  <Box display="flex">
                    {values.map((value: FunctionOperator) => {
                      const operator = value.details ? (
                        <Tooltip
                          title={value.details}
                          placement="right"
                          key={value.symbol}
                        >
                          <Typography fontSize="inherit" padding={1}>
                            {value.symbol}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography
                          fontSize="inherit"
                          padding={1}
                          key={value.symbol}
                        >
                          {value.symbol}
                        </Typography>
                      );
                      return operator;
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
