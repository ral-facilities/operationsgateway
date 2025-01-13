import { zodResolver } from '@hookform/resolvers/zod';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  IconButton,
  TextField,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAddUser } from '../../api/user';
import { APIError, User, type UserPost } from '../../app.types';
import { AUTH_TYPE_LIST, AUTHORISED_ROUTE_LIST } from './usersTable.component';

export interface UserDialogueProps {
  onClose: () => void;
  open: boolean;
  requestType: 'post' | 'patch';
}

interface BaseZodSchemaProps {
  errorMessage?: string;
}

const OptionalStringSchema = z
  .string()
  .trim()
  .transform((val) => (!val ? undefined : val))
  .optional();

const MandatoryStringSchema = (props: BaseZodSchemaProps) =>
  z
    .string({
      required_error: props.errorMessage,
    })
    .trim()
    .min(1, { message: props.errorMessage });

// Define Zod schema for the User form
const userSchema = z.object({
  _id: MandatoryStringSchema({ errorMessage: 'Username is required.' }),
  sha256_password: OptionalStringSchema,
  auth_type: MandatoryStringSchema({}),
  authorised_routes: z
    .array(z.string())
    .transform((val) => (val.length === 0 || !val ? undefined : val))
    .optional(),
});

const UserDialogue = (props: UserDialogueProps) => {
  const { open, onClose, requestType } = props;

  const initialUser: UserPost = {
    _id: '',
    sha256_password: '',
    auth_type: 'local',
    authorised_routes: [],
  };

  const {
    control,
    register,
    watch,
    handleSubmit,
    clearErrors,
    setError,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UserPost>({
    resolver: zodResolver(userSchema),
    defaultValues: initialUser,
  });
  const userFormData = watch();
  React.useEffect(() => {
    if (userFormData.auth_type === 'FedID') {
      setValue('sha256_password', undefined);
    }
  }, [setValue, userFormData.auth_type]);

  const handleClose = React.useCallback(() => {
    reset();
    clearErrors();
    onClose();
  }, [clearErrors, onClose, reset]);

  const { mutateAsync: addUser, isPending: isAddPending } = useAddUser();
  const handleAddUser = React.useCallback(
    async (user: User) => {
      addUser(user)
        .then(() => handleClose())
        .catch((error: AxiosError) => {
          const errorDetail = (error.response?.data as APIError).detail;

          if (typeof errorDetail === 'string') {
            let field: 'root.formError' | 'sha256_password' | '_id' =
              'root.formError';
            let message: string = errorDetail;

            if (errorDetail.toLowerCase().includes('password')) {
              field = 'sha256_password';
            } else if (errorDetail.toLowerCase().includes('username')) {
              field = '_id';
            } else {
              message = 'An unexpected error occurred. Please try again later.';
            }

            setError(field, { message });
          }
        });
    },
    [addUser, handleClose, setError]
  );

  const onSubmit = (data: UserPost) => {
    const newData: UserPost = {
      ...data,
      ...(data.sha256_password && {
        sha256_password: data.sha256_password,
      }),
    };

    if (requestType === 'post') handleAddUser(newData);
  };

  const [showPassword, setShowPassword] = React.useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add User</DialogTitle>
      <DialogContent>
        <Controller
          name="auth_type"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              options={AUTH_TYPE_LIST}
              disableClearable
              getOptionLabel={(option) => option}
              onChange={(_, value) => field.onChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Auth Type"
                  margin="dense"
                  fullWidth
                  error={!!errors.auth_type}
                  helperText={errors.auth_type?.message}
                />
              )}
            />
          )}
        />

        <TextField
          {...register('_id')}
          label={'Username'}
          id="user-id"
          fullWidth
          autoComplete="new-password"
          margin="dense"
          error={!!errors._id}
          helperText={errors._id?.message}
        />
        {userFormData.auth_type === 'local' && (
          <TextField
            {...register('sha256_password')}
            label="Password"
            id="user-password"
            type={
              //This prevents the browser autocomplete password
              !userFormData.sha256_password
                ? 'text'
                : showPassword
                  ? 'text'
                  : 'password'
            }
            autoComplete="new-password"
            fullWidth
            InputProps={{
              endAdornment: (
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={togglePasswordVisibility}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
            margin="dense"
            error={!!errors.sha256_password}
            helperText={errors.sha256_password?.message}
          />
        )}
        <Controller
          name="authorised_routes"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              value={field.value ?? undefined}
              multiple
              options={AUTHORISED_ROUTE_LIST}
              getOptionLabel={(option) => option}
              onChange={(_, value) => field.onChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Authorised Routes"
                  margin="dense"
                  fullWidth
                  error={!!errors.authorised_routes}
                  helperText={errors.authorised_routes?.message}
                />
              )}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={Object.values(errors).length !== 0 || isAddPending}
          onClick={handleSubmit(onSubmit)}
        >
          Submit
        </Button>
      </DialogActions>
      {errors.root?.formError && (
        <FormHelperText
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
          error
        >
          {errors.root?.formError.message}
        </FormHelperText>
      )}
    </Dialog>
  );
};

export default UserDialogue;
