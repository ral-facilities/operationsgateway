import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Typography,
  TextField,
} from '@mui/material';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  changeAppliedFunctions,
  selectAppliedFunctions,
} from '../state/slices/functionsSlice';
import { AddCircle, Delete } from '@mui/icons-material';
import { FunctionItem, timeChannelName } from '../app.types';
import { selectColumn } from '../state/slices/tableSlice';
import FunctionInput from './functionInput.component';
import { useChannels } from '../api/channels';
import { Token } from '../filtering/filterParser';
import { useFunctionReturnType, useTokens } from '../api/functions';
interface FunctionsDialogueProps {
  open: boolean;
  onClose: () => void;
}

const Heading = (props: React.ComponentProps<typeof Typography>) => {
  const { children, ref, ...restProps } = props;
  return (
    <Typography
      variant="body1"
      component="h3"
      gutterBottom
      sx={{ fontWeight: 'bold' }}
      {...restProps}
    >
      {children}
    </Typography>
  );
};
const Body = (props: React.ComponentProps<typeof Typography>) => (
  <Typography variant="body2" gutterBottom>
    {props.children}
  </Typography>
);

const FunctionsDialogue = (props: FunctionsDialogueProps) => {
  const { open, onClose } = props;
  const dispatch = useAppDispatch();
  const appliedFunctions = useAppSelector(selectAppliedFunctions);
  const [functions, setFunctions] =
    React.useState<FunctionItem[]>(appliedFunctions);
  const [errors, setErrors] = React.useState<string[]>(
    appliedFunctions.map(() => '')
  );
  const { data: channels } = useChannels({
    select: (channels) => {
      return channels
        .filter((channel) => channel.systemName !== timeChannelName)
        .map(
          (channel) =>
            ({
              type: 'channel',
              value: channel.systemName,
              label: channel?.name ?? channel.systemName,
            }) as Token
        );
    },
  });
  const { data: tokens } = useTokens();

  React.useEffect(() => {
    setFunctions(appliedFunctions);
  }, [appliedFunctions]);

  const handleChangeName = React.useCallback(
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setFunctions((functions) => {
        return [
          ...functions.slice(0, index),
          { ...functions[index], name: event.target.value },
          ...functions.slice(index + 1),
        ];
      }),
    []
  );

  // const handleChangeExpression = React.useCallback(
  //   (index: number) => (event: React.ChangeEvent<HTMLInputElement>) =>
  //     setFunctions((functions) => {
  //       return [
  //         ...functions.slice(0, index),
  //         { ...functions[index], expression: event.target.value },
  //         ...functions.slice(index + 1),
  //       ];
  //     }),
  //   []
  // );

  const handleChangeValue = React.useCallback(
    (index: number) => (value: Token[]) =>
      setFunctions((functions) => {
        return [
          ...functions.slice(0, index),
          { ...functions[index], expression: value },
          ...functions.slice(index + 1),
        ];
      }),
    []
  );
  const handleChangeError = React.useCallback(
    (index: number) => (value: string) =>
      setErrors((errors) => {
        return [...errors.slice(0, index), value, ...errors.slice(index + 1)];
      }),
    []
  );

  // const handleCheckErrors = React.useCallback((index: number) => () => {
  //   useFunctionReturnType()
  // }, []);

  const newFunctions = functions.filter(
    (f) => f.name.length > 0 || f.expression.length > 0
  );

  const applyFunctions = React.useCallback(() => {
    dispatch(changeAppliedFunctions(newFunctions));
    newFunctions.forEach((newFunction) =>
      dispatch(selectColumn(newFunction.name))
    );
    onClose();
  }, [dispatch, onClose, newFunctions]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Functions</DialogTitle>
      <DialogContent>
        <Grid container columnSpacing={2}>
          <Grid container item xs pr={1} flexDirection="column" rowSpacing={1}>
            <Heading mt={1}>Enter function</Heading>
            {functions.map((functionItem, index) => (
              <Grid container item key={index}>
                <Grid item xs>
                  <TextField
                    value={functionItem.name}
                    onChange={handleChangeName(index)}
                  />
                </Grid>
                <Grid item xs>
                  {/* <TextField
                    value={functionItem.expression}
                    onChange={handleChangeExpression(index)}
                  /> */}
                  <FunctionInput
                    channels={channels ?? []}
                    backendTokens={tokens ?? []}
                    index={index}
                    functionItems={functions}
                    value={functionItem.expression}
                    setValue={handleChangeValue(index)}
                    error={errors[index]}
                    setError={handleChangeError(index)}
                    // checkErrors={handleCheckErrors(index)}
                  />
                </Grid>
                <Grid item xs={0.6} mt={0.5}>
                  <IconButton
                    onClick={() => {
                      setFunctions((functions) =>
                        functions.filter((_, i) => i !== index)
                      );
                    }}
                    size="small"
                    aria-label={`Delete function ${index}`}
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Grid item>
              <Button
                onClick={() => {
                  setFunctions((functions) => [
                    ...functions,
                    { name: '', expression: [] },
                  ]);
                  setErrors((errors) => [...errors, '']);
                }}
                variant="outlined"
                size="small"
                startIcon={<AddCircle />}
              >
                Add new function
              </Button>
            </Grid>
          </Grid>
          <Divider orientation="vertical" flexItem />
          <Grid item xs>
            <Heading>Functions help</Heading>
            <Body>TODO</Body>
            <Heading>Operators included</Heading>
            <Body>
              {'=, !=, >, <, >=, <=, is null, is not null, and, or, not, (, )'}
            </Body>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={() => applyFunctions()}>Apply</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FunctionsDialogue;
