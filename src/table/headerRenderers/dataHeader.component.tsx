import {
  Typography,
  Box,
  TableSortLabel,
  Divider,
  TableCell,
  SxProps,
  styled,
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import React from 'react';
import { Order } from '../../app.types';
import { TableResizerProps } from 'react-table';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';

const StyledClose = styled(Close)(() => ({
  cursor: 'pointer',
  color: 'black',
  '&:hover': {
    color: 'red',
  },
}));

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
  onClose: (column: string) => void;
  index: number;
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
    onClose,
    index,
  } = props;

  const [permitDragging, setPermitDragging] = React.useState<boolean>(true);

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
      data-testid={`sort ${dataKey}`}
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

  const TableCellContent = (props: {
    provided?: DraggableProvided;
  }): React.ReactElement => {
    const { provided } = props;
    return (
      <TableCell
        {...provided?.draggableProps}
        ref={provided?.innerRef}
        {...provided?.dragHandleProps}
        size="small"
        component="th"
        role="columnheader"
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
          <Box
            aria-label={`${dataKey} header`}
            display="flex"
            onMouseDown={(event) => {
              // Middle mouse button can also fire onClose
              if (dataKey.toUpperCase() !== 'ID' && event.button === 1) {
                event.preventDefault();
                onClose(dataKey);
              }
            }}
          >
            {Icon && <Box marginRight={1}>{<Icon />}</Box>}
            <Box>{inner}</Box>
          </Box>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            // 40 - enough space for both close icon + divider and some space between them
            width: dataKey.toUpperCase() === 'ID' ? '5px' : '40px',
            justifyContent: 'space-between',
          }}
          onMouseOver={() => {
            setPermitDragging(false);
          }}
          onMouseOut={() => {
            setPermitDragging(true);
          }}
        >
          {/* If this is an ID header, remove icon visibility but still render it
          This ensures header widths remain consistent */}
          <div aria-label={`close ${dataKey}`}>
            <StyledClose
              sx={
                dataKey.toUpperCase() === 'ID'
                  ? {
                      display: 'none',
                    }
                  : {}
              }
              onClick={() => onClose(dataKey)}
            />
          </div>
          <div
            {...resizerProps}
            style={{
              cursor: 'col-resize',
            }}
          >
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                height: '100%',
                borderRightWidth: 5,
              }}
            />
          </div>
        </div>
      </TableCell>
    );
  };

  // ID column must not be reordered
  return dataKey.toUpperCase() !== 'ID' ? (
    <Draggable
      draggableId={dataKey}
      index={index}
      isDragDisabled={!permitDragging}
    >
      {(provided) => <TableCellContent provided={provided} />}
    </Draggable>
  ) : (
    <TableCellContent />
  );
};

DataHeader.displayName = 'DataHeader';

export default DataHeader;
