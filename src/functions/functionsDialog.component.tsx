import { AddCircle, Delete } from '@mui/icons-material';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { useChannels } from '../api/channels';
import { useFunctionsTokens, useValidateFunctions } from '../api/functions';
import {
  APIError,
  APIErrorResponse,
  DataType,
  FunctionToken,
  ValidateFunctionState,
} from '../app.types';
import { Heading } from '../filtering/filterDialogue.component';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
  changeAppliedFunctions,
  selectAppliedFunctions,
} from '../state/slices/functionsSlice';
import {
  selectSelectedIds,
  updateSelectedColumns,
} from '../state/slices/tableSlice';
import FunctionsHelp from './functionsHelp.component';
import FunctionsInputs from './functionsInputs.component';

export interface errorState {
  name?: { message: string };
  expression?: { message: string };
}
export interface FunctionErrorState {
  [id: string]: errorState;
}

export interface FunctionsDialogProps {
  open: boolean;
  onClose: () => void;
}

const parseErrorCode = (
  errorCode: string | APIErrorResponse[]
): { index: number; errorMessage: string; isNameError: boolean }[] => {
  if (typeof errorCode === 'string') {
    const parts = errorCode.split(':');
    const errorMessage = parts[1].trim();
    const indexPart = parts[0].split(' ');
    const index = parseInt(indexPart[indexPart.length - 1], 10);

    const includesFunctionName = errorMessage.includes('name');

    return [{ index, errorMessage, isNameError: includesFunctionName }];
  } else {
    return errorCode.map((code) => {
      const index = Number(code.loc[1]);
      const errorMessage = code.msg;
      const isNameError = code.loc[2] === 'name';
      return { index, errorMessage, isNameError };
    });
  }
};

const FunctionsDialog = (props: FunctionsDialogProps) => {
  const { open, onClose } = props;

  const dispatch = useAppDispatch();
  const appliedFunctions = useAppSelector(selectAppliedFunctions);
  const appliedSelectedIds = useAppSelector(selectSelectedIds);

  const appliedSelectedIdsWithoutFuncs = appliedSelectedIds.filter(
    (id) => !appliedFunctions.map((func) => func.name).includes(id)
  );

  const [functions, setFunctions] =
    React.useState<ValidateFunctionState[]>(appliedFunctions);
  const [errors, setErrors] = React.useState<FunctionErrorState>({});
  const [selectedColIds, setSelectedColIds] = React.useState<string[]>(
    appliedFunctions
      .filter((func) => appliedSelectedIds.includes(func.name))
      .map((func) => func.id)
  );

  const { data: functionTokens } = useFunctionsTokens();

  const formattedFunctionTokens = React.useMemo(
    () =>
      functionTokens?.map(
        (token) =>
          ({
            type: 'functionToken',
            value: token.symbol,
            label: token.symbol,
          }) as FunctionToken
      ) ?? [],
    [functionTokens]
  );

  const { data: channels } = useChannels({
    select: (channels) => {
      return channels.map(
        (channel) =>
          ({
            type: 'channel',
            value: channel.systemName,
            label: channel?.name ?? channel.systemName,
          }) as FunctionToken
      );
    },
  });

  const handleClose = React.useCallback(() => {
    onClose();
    setSelectedColIds(
      appliedFunctions
        .filter((func) => appliedSelectedIds.includes(func.name))
        .map((func) => func.id)
    );
  }, [appliedFunctions, appliedSelectedIds, onClose]);

  const handleChangeValue = React.useCallback(
    (id: string) => (update: Partial<ValidateFunctionState>) =>
      setFunctions((functions) => {
        // Find the index of the function with the given id
        const index = functions.findIndex((func) => func.id === id);
        if (index === -1) {
          return functions;
        }

        // Copy the existing function state
        const newFunctions = [...functions];

        // channels names

        const channelNames = update?.expression
          ?.map((exp) => {
            if (exp.type === 'channel') return exp.value;
            return undefined;
          })
          .filter((exp) => !!exp) as string[];
        // Only update properties that exist in the update object
        const updatedFunctionState: ValidateFunctionState = {
          ...functions[index],
          ...(update.name !== undefined && { name: update.name }),
          ...(update.dataType !== undefined && { type: update.dataType }),
          ...(update.expression !== undefined && {
            expression: update.expression,
            channels: channelNames,
          }),
        };

        // Replace the old function state with the updated one
        newFunctions[index] = updatedFunctionState;

        return newFunctions;
      }),
    []
  );

  const handleChangeError = React.useCallback(
    (id: string) => (value?: Partial<FunctionErrorState[string]>) =>
      setErrors((errors) => {
        // Copy the existing error state
        const newErrors = { ...errors };

        // Create a new error state for the specified id
        const updatedErrorState: FunctionErrorState[string] = {
          ...errors[id],
          ...value, // Spread the value object to update name and/or expression
        };

        // Replace the old error state with the updated one
        if (value) {
          newErrors[id] = updatedErrorState;
        } else {
          delete newErrors[id];
        }

        return newErrors;
      }),
    []
  );
  React.useEffect(() => {
    if (open) {
      const functionId = crypto.randomUUID();
      if (appliedFunctions.length === 0)
        setSelectedColIds((prevSelectedIds) => [
          ...prevSelectedIds,
          functionId,
        ]);
      setFunctions(
        appliedFunctions.length === 0
          ? [
              {
                id: functionId,
                name: '',
                expression: [],
                dataType: 'scalar',
                channels: [],
              },
            ]
          : appliedFunctions
      );
      setErrors({});
    }
  }, [appliedFunctions, open]);
  const handleError = React.useCallback(
    (error: AxiosError) => {
      const errorCode = (error.response?.data as APIError).detail;

      if (typeof errorCode === 'string' && !errorCode.includes(':')) return;
      const parsedErrors = parseErrorCode(errorCode);
      parsedErrors.forEach((error) => {
        const { index, errorMessage, isNameError } = error;
        const functionId = functions[index].id;
        handleChangeError(functionId)(
          isNameError
            ? { name: { message: errorMessage } }
            : { expression: { message: errorMessage } }
        );
      });
    },
    [functions, handleChangeError]
  );

  const { mutateAsync: postValidateFunctions } = useValidateFunctions();

  const checkErrors = React.useCallback(
    (index: number, id: string) => {
      const functionsToValidate = functions.slice(0, index + 1);
      postValidateFunctions(functionsToValidate)
        .then(() => {
          setErrors((errors) => {
            const updatedErrors = JSON.parse(JSON.stringify(errors));
            delete updatedErrors[id];
            return updatedErrors;
          });
        })
        .catch(handleError);
    },
    [functions, handleError, postValidateFunctions]
  );

  const applyFunctions = React.useCallback(
    (newFunctions: ValidateFunctionState[]) => {
      postValidateFunctions(functions)
        .then((response: string[]) => {
          dispatch(
            changeAppliedFunctions(
              newFunctions.map((func, index) => ({
                ...func,
                dataType: response[index] as DataType,
              }))
            )
          );
          const selectedFunctionCols = functions
            .filter((func) => selectedColIds.includes(func.id))
            .map((func) => func.name);

          dispatch(
            updateSelectedColumns([
              ...appliedSelectedIdsWithoutFuncs,
              ...selectedFunctionCols,
            ])
          );
          onClose();
        })
        .catch(handleError);
    },
    [
      postValidateFunctions,
      functions,
      handleError,
      dispatch,
      appliedSelectedIdsWithoutFuncs,
      onClose,
      selectedColIds,
    ]
  );

  const tokenisedFunctions: FunctionToken[] = functions
    .filter((func) => func.expression.length !== 0)
    .filter((func) => func.name.trim() !== '')
    .map((func) => ({
      type: 'function',
      value: func.name,
      label: func.name,
    }));

  React.useEffect(() => {
    setSelectedColIds(
      appliedFunctions
        .filter((func) => appliedSelectedIds.includes(func.name))
        .map((func) => func.id)
    );
  }, [appliedFunctions, appliedSelectedIds]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Functions</DialogTitle>
      <DialogContent>
        <Grid container columnSpacing={2}>
          <Grid container item xs pr={1} flexDirection="column" rowSpacing={1}>
            <Heading mt={1}>Enter function</Heading>
            {functions.map((func, index) => {
              return (
                <Grid pl={0} container item key={func.id}>
                  <Grid item>
                    <Tooltip
                      title={
                        selectedColIds.includes(func.id)
                          ? 'Hide function column'
                          : `Display function column`
                      }
                      arrow
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedColIds.includes(func.id)}
                            onChange={(event) => {
                              const isChecked = event.target.checked;
                              setSelectedColIds((prevSelectedIds) =>
                                isChecked
                                  ? [...prevSelectedIds, func.id]
                                  : prevSelectedIds.filter(
                                      (id) => id !== func.id
                                    )
                              );
                            }}
                          />
                        }
                        aria-label={`${func.name || 'Unnamed Function'} Checkbox`}
                        label=""
                      />
                    </Tooltip>
                  </Grid>
                  <Grid item xs>
                    <FunctionsInputs
                      channels={[...(channels ?? [])]}
                      operators={formattedFunctionTokens}
                      functions={tokenisedFunctions.filter(
                        (token) => token.value !== func.name
                      )}
                      value={func}
                      setValue={handleChangeValue(func.id)}
                      error={errors[func.id]}
                      setError={handleChangeError(func.id)}
                      checkErrors={() => checkErrors(index, func.id)}
                    />
                  </Grid>
                  <Grid item xs={0.6} mt={0.5}>
                    <IconButton
                      onClick={() => {
                        setFunctions((prevFunctions) =>
                          prevFunctions.filter(
                            (currentFunc) => func.id !== currentFunc.id
                          )
                        );
                        setErrors((errors) => {
                          const newErrors = { ...errors };
                          delete newErrors[func.id];
                          return newErrors;
                        });
                      }}
                      size="small"
                      aria-label={`Delete function`}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              );
            })}

            <Grid item>
              <Button
                onClick={() => {
                  const functionId = crypto.randomUUID();
                  setFunctions((functions) => [
                    ...functions,
                    {
                      id: functionId,
                      name: '',
                      expression: [],
                      dataType: 'scalar',
                      channels: [],
                    },
                  ]);

                  setSelectedColIds((prevSelectedIds) => [
                    ...prevSelectedIds,
                    functionId,
                  ]);
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
          <Grid item xs={12} sm={5}>
            {functionTokens && <FunctionsHelp data={functionTokens} />}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button
          disabled={Object.keys(errors).length !== 0 || functions.length === 0}
          onClick={() => {
            applyFunctions(functions);
          }}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FunctionsDialog;
