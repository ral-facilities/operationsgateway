import { Chip, Stack } from '@mui/material';
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import { useUsers } from '../../api/user';
import { User } from '../../app.types';

const AUTHORISED_ROUTE_LIST = [
  '/submit/hdf POST',
  '/submit/manifest POST',
  '/records/{id_} DELETE',
  '/experiments POST',
  '/users POST',
  '/users PATCH',
  '/users/{id_} DELETE',
];

const AUTH_TYPE_LIST = ['local', 'FedID'];
function UsersTable() {
  const { data: userData, isLoading: userDataLoading } = useUsers();

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
              <Chip key={index} label={route} variant="outlined" />
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
    enableRowActions: false,
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
  });
  return <MaterialReactTable table={table} />;
}

export default UsersTable;
