import {
  Typography,
  Box,
  TableSortLabel,
  Divider,
  TableCell,
  SxProps,
  Tooltip,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { MoreVert, Feed, Close, WrapText } from '@mui/icons-material';
import React from 'react';
import { FullChannelMetadata, Order } from '../../app.types';
import { TableResizerProps } from 'react-table';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';

export interface DataHeaderProps {
  disableSort?: boolean;
  dataKey: string;
  sort: { [column: string]: Order };
  sx?: SxProps;
  onSort: (column: string, order: Order | null) => void;
  defaultSort?: Order;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  resizerProps: TableResizerProps;
  onClose: (column: string) => void;
  onToggleWordWrap: (column: string) => void;
  index: number;
  channelInfo?: FullChannelMetadata;
  wordWrap: boolean;
}

export interface ColumnMenuProps {
  dataKey: string;
  onClose: (column: string) => void;
  onToggleWordWrap: (column: string) => void;
  wordWrap: boolean;
}

const ColumnMenu = (props: ColumnMenuProps): React.ReactElement => {
  const { dataKey, onClose, onToggleWordWrap, wordWrap } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        aria-label={`${dataKey} menu`}
        id={`${dataKey}-menu-button`}
        aria-controls={open ? `${dataKey}-menu` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        size="small"
      >
        <MoreVert fontSize="inherit" />
      </IconButton>
      <Menu
        id={`${dataKey}-menu`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': `${dataKey}-menu-button`,
          dense: true,
        }}
      >
        <MenuItem
          onClick={() => {
            onToggleWordWrap(dataKey);
            handleClose();
          }}
        >
          <ListItemIcon>
            <WrapText />
          </ListItemIcon>
          <ListItemText>Turn word wrap {wordWrap ? 'off' : 'on'}</ListItemText>
        </MenuItem>
        {dataKey.toUpperCase() !== 'TIMESTAMP' && (
          <MenuItem
            onClick={() => {
              onClose(dataKey);
              handleClose();
            }}
          >
            <ListItemIcon>
              <Close />
            </ListItemIcon>
            <ListItemText>Close</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

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
    channelInfo,
    wordWrap,
    onToggleWordWrap,
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
      sx={{ margin: 0 }}
    >
      <Typography
        sx={{ fontSize: 'inherit', lineHeight: 'inherit' }}
        noWrap={!wordWrap}
      >
        {label}
      </Typography>
    </TableSortLabel>
  ) : (
    <div>
      <Typography
        sx={{ fontSize: 'inherit', lineHeight: 'inherit' }}
        noWrap={!wordWrap}
      >
        {label}
      </Typography>
    </div>
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
        <Box
          aria-label={`${dataKey} header`}
          display="flex"
          sx={{
            // overflow: 'hidden',
            flex: 1,
            minWidth: 0,
          }}
          onMouseDown={(event) => {
            // Middle mouse button can also fire onClose
            if (dataKey.toUpperCase() !== 'TIMESTAMP' && event.button === 1) {
              event.preventDefault();
              onClose(dataKey);
            }
          }}
        >
          <Box marginRight={1}>{Icon ?? <Feed />}</Box>
          {/* TODO: add extra info to tooltip from data channel info */}
          <Tooltip
            enterDelay={400}
            enterNextDelay={400}
            title={
              <div>
                {channelInfo?.userFriendlyName && (
                  <Typography>
                    System Name: {channelInfo.systemName}{' '}
                  </Typography>
                )}
                <Typography>Description: {channelInfo?.description}</Typography>
                <Typography>Units: {channelInfo?.units}</Typography>
              </div>
            }
          >
            <Box>{inner}</Box>
          </Tooltip>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            // 33 - enough space for both menu icon + divider
            width: '33px',
            justifyContent: 'space-between',
            zIndex: 2,
            // TODO: switch to theme background color
            backgroundColor: 'white',
          }}
          onMouseOver={() => {
            setPermitDragging(false);
          }}
          onMouseOut={() => {
            setPermitDragging(true);
          }}
        >
          <ColumnMenu
            dataKey={dataKey}
            onClose={onClose}
            wordWrap={wordWrap}
            onToggleWordWrap={onToggleWordWrap}
          />
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
        </Box>
      </TableCell>
    );
  };

  // Timestamp column must not be reordered
  return dataKey.toUpperCase() !== 'TIMESTAMP' ? (
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
