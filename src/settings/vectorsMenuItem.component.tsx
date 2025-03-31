import { FormControl, FormGroup, MenuItem, TextField } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import {
  useUpdateUserPreference,
  useUserPreference,
} from '../api/userPreferences';
import {
  VECTOR_LIMIT_PREFERENCE_NAME,
  VECTOR_SKIP_PREFERENCE_NAME,
} from '../app.types';
import handleOG_APIError from '../handleOG_APIError';

const OptionalNumberSchema = (props: {
  invalidTypeErrorMessage?: string;
  min?: number;
  max?: number;
  isInteger?: boolean;
}) =>
  z
    .string()
    .trim()
    .transform((val) => (!val ? null : val))
    .pipe(
      z.coerce
        .number({
          invalid_type_error: props.invalidTypeErrorMessage,
        })
        .min(props.min ?? -Infinity, {
          message: `Number must be greater than or equal to ${props.min}`,
        })
        .max(props.max ?? Infinity, {
          message: `Number must be less than or equal to ${props.max}`,
        })
        .refine((value) => (props.isInteger ? Number.isInteger(value) : true), {
          message: 'Please enter a valid integer.',
        })
        .nullable()
    );

const vectorSchema = z.object({
  vectorLimit: OptionalNumberSchema({
    invalidTypeErrorMessage: 'Vector Limit must be a valid number',
    min: 0,
    isInteger: true,
  }),
  vectorSkip: OptionalNumberSchema({
    invalidTypeErrorMessage: 'Vector Skip must be a valid number',
    min: 0,
    isInteger: true,
  }),
});

const VectorsMenuItem = () => {
  const { data: vectorSkipData } = useUserPreference<string>(
    VECTOR_SKIP_PREFERENCE_NAME
  );

  const { data: vectorLimitData } = useUserPreference<string>(
    VECTOR_LIMIT_PREFERENCE_NAME
  );

  const { mutateAsync: mutateVectorSkip } = useUpdateUserPreference<
    string | null
  >(VECTOR_SKIP_PREFERENCE_NAME);

  const { mutateAsync: mutateVectorLimit } = useUpdateUserPreference<
    string | null
  >(VECTOR_LIMIT_PREFERENCE_NAME);

  const queryClient = useQueryClient();

  const [vectorLimit, setVectorLimit] = useState(vectorLimitData || '');
  const [vectorSkip, setVectorSkip] = useState(vectorSkipData || '');
  const [errors, setErrors] = useState<{
    vectorLimit?: string;
    vectorSkip?: string;
  }>({});
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    setVectorLimit(vectorLimitData || '');
  }, [vectorLimitData]);

  useEffect(() => {
    setVectorSkip(vectorSkipData || '');
  }, [vectorSkipData]);

  const validateAndChangeVectorPreference = React.useCallback(
    async (
      key: string,
      value: string,
      changeFunction: (params: {
        value: string | null;
      }) => Promise<string | null>
    ) => {
      const invalidateQueries = () => {
        queryClient.invalidateQueries({
          predicate: (query) =>
            (query.queryKey[0] === 'records' &&
              'page' in (query.queryKey[1] as object)) ||
            query.queryKey[0] === 'thumbnails',
        });
      };
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const newTimer = setTimeout(async () => {
        const newKey =
          key === VECTOR_LIMIT_PREFERENCE_NAME ? 'vectorLimit' : 'vectorSkip';
        const parsed = z
          .object({
            [newKey]: vectorSchema.shape[newKey],
          })
          .safeParse({ [newKey]: value });

        if (!parsed.success) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [newKey]: parsed.error.format()[newKey]?._errors[0],
          }));
          return;
        }

        if (
          key === VECTOR_LIMIT_PREFERENCE_NAME &&
          !!value.trim() &&
          Number(vectorSkip) > Number(value)
        ) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [newKey]:
              'Vector Limit must be greater than or equal to Vector Skip.',
          }));
          return;
        }
        setErrors((prevErrors) => ({ ...prevErrors, [newKey]: undefined }));

        await changeFunction({ value: value.trim() ? value : null })
          .then(() => {
            invalidateQueries();
          })
          .catch((error: AxiosError) => {
            handleOG_APIError(error, false);
          });
      }, 500); // debounce delay

      setDebounceTimer(newTimer);
    },
    [debounceTimer, queryClient, vectorSkip]
  );

  const handleChange = (
    key: string,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    changeFunction: (params: { value: string | null }) => Promise<string | null>
  ) => {
    setter(value);
    validateAndChangeVectorPreference(key, value, changeFunction);
  };

  return (
    <MenuItem
      sx={{ '&:hover': { backgroundColor: 'transparent' }, cursor: 'unset' }}
      disableRipple
    >
      <FormGroup>
        <FormControl sx={{ my: 1 }}>
          <TextField
            label="Vector Skip"
            value={vectorSkip || ''}
            onChange={(e) =>
              handleChange(
                VECTOR_SKIP_PREFERENCE_NAME,
                e.target.value,
                setVectorSkip,
                mutateVectorSkip
              )
            }
            fullWidth
            error={!!errors.vectorSkip}
            helperText={errors.vectorSkip}
          />
        </FormControl>
        <FormControl>
          <TextField
            label="Vector Limit"
            value={vectorLimit || ''}
            onChange={(e) =>
              handleChange(
                VECTOR_LIMIT_PREFERENCE_NAME,
                e.target.value,
                setVectorLimit,
                mutateVectorLimit
              )
            }
            fullWidth
            error={!!errors.vectorLimit}
            helperText={errors.vectorLimit}
          />
        </FormControl>
      </FormGroup>
    </MenuItem>
  );
};

export default VectorsMenuItem;
