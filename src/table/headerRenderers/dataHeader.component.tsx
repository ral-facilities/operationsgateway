import {
  Typography,
  Box,
  TableSortLabel,
  Divider,
  TableCell,
  SxProps,
} from '@mui/material';
import React from 'react';
import { Order } from '../../app.types';
import Draggable from 'react-draggable';
import { TableResizerProps } from 'react-table';

export interface DataHeaderProps {
  disableSort?: boolean;
  dataKey: string;
  sort: { [column: string]: Order };
  sx?: SxProps;
  onSort: (column: string, order: Order | null) => void;
  defaultSort?: Order;
  label?: React.ReactNode;
  icon?: React.ComponentType<unknown>;
  resizerProps: TableResizerProps;
}

const DataHeader = (props: DataHeaderProps): React.ReactElement => {
  const {
    sx,
    icon: Icon,
    disableSort,
    dataKey,
    sort,
    onSort,
    defaultSort,
    label,
    resizerProps,
  } = props;

  const currSortDirection = sort[dataKey];

  //Apply default sort on page load (but only if not already defined in URL params)
  //This will apply them in the order of the column definitions given to a table
  React.useEffect(() => {
    if (defaultSort !== undefined && currSortDirection === undefined)
      onSort(dataKey, defaultSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let nextSortDirection: Order | null = null;
  switch (currSortDirection) {
    case 'asc':
      nextSortDirection = 'desc';
      break;
    case 'desc':
      nextSortDirection = null;
      break;
    case undefined:
      nextSortDirection = 'asc';
  }

  const inner = !disableSort ? (
    <TableSortLabel
      active={dataKey in sort}
      direction={currSortDirection}
      onClick={() => onSort(dataKey, nextSortDirection)}
    >
      <Typography noWrap sx={{ fontSize: 'inherit', lineHeight: 'inherit' }}>
        {label}
      </Typography>
    </TableSortLabel>
  ) : (
    <Typography noWrap sx={{ fontSize: 'inherit', lineHeight: 'inherit' }}>
      {label}
    </Typography>
  );

  return (
    <TableCell
      size="small"
      component="div"
      sx={sx}
      variant="head"
      sortDirection={currSortDirection}
    >
      <div
        style={{
          overflow: 'hidden',
          flex: 1,
        }}
      >
        <Box display="flex">
          <Box marginRight={1}>{Icon && <Icon />}</Box>
          <Box>{inner}</Box>
        </Box>
      </div>
      <Divider
        orientation="vertical"
        flexItem
        sx={{
          height: '100%',
          display: 'list-item',
        }}
        {...resizerProps}
      />
      {/* <Draggable axis="none" {...resizerProps}>
        <div
          style={{
            marginLeft: 18,
            paddingLeft: '4px',
            paddingRight: '4px',
            cursor: 'col-resize',
          }}
        > */}

      {/* </div>
      </Draggable> */}
    </TableCell>
  );
};

DataHeader.displayName = 'DataHeader';

export default DataHeader;
