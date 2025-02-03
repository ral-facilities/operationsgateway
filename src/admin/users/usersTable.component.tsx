import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PasswordIcon from '@mui/icons-material/Password';
import {
  Box,
  Button,
  Chip,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { useUsers } from '../../api/user';
import { User } from '../../app.types';
import DeleteUserDialogue from './deleteUserDialogue.component';
import UserDialogue from './userDialogue.component';

export const AUTHORISED_ROUTE_LIST = [
  '/submit/hdf POST',
  '/submit/manifest POST',
  '/records/{id_} DELETE',
  '/experiments POST',
  '/users POST',
  '/users PATCH',
  '/users/{id_} DELETE',
];

export const AUTH_TYPE_LIST = ['local', 'FedID'];
function UsersTable() {
  const { data: userData, isLoading: userDataLoading } = useUsers();

  const [requestType, setRequestType] = React.useState<
    'patchPassword' | 'patchAuthorisedRoutes' | 'post' | 'delete' | false
  >('post');

  const [selectedUser, setSelectedUser] = React.useState<User | undefined>(
    undefined
  );

  // Define the columns for the table
  const columns: MRT_ColumnDef<User>[] = [
    {
      accessorKey: 'username',
      header: 'Username',
    },

    {
      accessorKey: 'auth_type',
      header: 'Auth Type',
      filterVariant: 'autocomplete',
      filterSelectOptions: AUTH_TYPE_LIST,
    },
    {
      accessorKey: 'authorised_routes',
      header: 'Authorised Routes',
      filterVariant: 'autocomplete',
      filterSelectOptions: AUTHORISED_ROUTE_LIST,
      Cell: ({ cell }) => {
        const routes = cell.getValue() as string[] | null;
        return routes && routes.length > 0 ? (
          <Stack direction="column" spacing={1} flexWrap="wrap">
            {routes.map((route, index) => (
              <Chip key={index} label={route} />
            ))}
          </Stack>
        ) : (
          ''
        );
      },
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data: userData?.users ?? [],
    // Features
    enableColumnOrdering: true,
    enableColumnResizing: false,
    enableFacetedValues: true,
    enableRowActions: true,
    enableStickyHeader: true,
    enableRowSelection: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enablePagination: true,
    // Other settings
    manualFiltering: false,
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    autoResetPageIndex: false,
    // Localisation
    localization: {
      ...MRT_Localization_EN,
    },
    // State
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
    },
    state: {
      pagination: { pageSize: 15, pageIndex: 0 },
      showProgressBars: userDataLoading,
    },
    // MUI
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [15, 30, 45],
      shape: 'rounded',
      variant: 'outlined',
    },
    muiTableContainerProps: {
      // Page height - unknown - app bar height - footer height - additional
      sx: {
        height: `calc(100vh - 8px - 64px - 24px - 250px)`,
      },
    },
    renderCreateRowDialogContent: ({ table }) => {
      return (
        <>
          <UserDialogue
            open={true}
            selectedUser={selectedUser}
            requestType={requestType === 'post' ? 'post' : 'patch'}
            passwordOnly={requestType === 'patchPassword'}
            authorisedRoutesOnly={requestType === 'patchAuthorisedRoutes'}
            onClose={() => {
              table.setCreatingRow(null);
            }}
          />
        </>
      );
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box>
        <Button
          startIcon={<AddIcon />}
          sx={{ mx: '4px' }}
          variant="outlined"
          onClick={() => {
            setRequestType('post');
            table.setCreatingRow(true);
          }}
        >
          Add User
        </Button>
        <Button
          startIcon={<ClearIcon />}
          sx={{ mx: '4px' }}
          variant="outlined"
          disabled={table.getState().columnFilters.length === 0}
          onClick={() => {
            table.resetColumnFilters();
          }}
        >
          Clear Filters
        </Button>
      </Box>
    ),
    renderRowActionMenuItems: ({ closeMenu, row }) => {
      return [
        <MenuItem
          key="modify_authorised_routes"
          aria-label={`Edit user ${row.original.username} authorised routes`}
          onClick={() => {
            setRequestType('patchAuthorisedRoutes');
            setSelectedUser(row.original);
            table.setCreatingRow(true);
            closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Modify Authorised Routes</ListItemText>
        </MenuItem>,
        ...(row.original.auth_type === 'local'
          ? [
              <MenuItem
                key="change_password"
                aria-label={`Change user ${row.original.username} password`}
                onClick={() => {
                  setRequestType('patchPassword');
                  setSelectedUser(row.original);
                  table.setCreatingRow(true);
                  closeMenu();
                }}
                sx={{ m: 0 }}
              >
                <ListItemIcon>
                  <PasswordIcon />
                </ListItemIcon>
                <ListItemText>Change Password</ListItemText>
              </MenuItem>,
            ]
          : []),
        <MenuItem
          key="delete"
          aria-label={`Delete user ${row.original.username}`}
          onClick={() => {
            setRequestType('delete');
            setSelectedUser(row.original);
            closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>,
      ];
    },
  });
  return (
    <>
      <MaterialReactTable table={table} />
      {selectedUser && (
        <DeleteUserDialogue
          open={requestType === 'delete'}
          onClose={() => {
            setRequestType(false);
          }}
          selectedUser={selectedUser}
        />
      )}
    </>
  );
}

export default UsersTable;
