import {
  Typography,
  Box,
  TableSortLabel,
  Divider,
  TableCell,
  SxProps,
  Tooltip,
  Theme,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVert,
  Feed,
  Close,
  WrapText,
  FilterAlt,
} from '@mui/icons-material';
import React from 'react';
import {
  FullChannelMetadata,
  isChannelMetadataScalar,
  isChannelMetadataWaveform,
  Order,
} from '../../app.types';
import { TableResizerProps } from 'react-table';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';

export interface DataHeaderProps {
  disableSort?: boolean;
  dataKey: string;
  sort: { [column: string]: Order };
  sx?: SxProps<Theme>;
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
  isFiltered: boolean;
  openFilters: (headerName: string) => void;
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

  const handleOptionsButtonClick = (event: React.MouseEvent<HTMLElement>) => {
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
        onClick={handleOptionsButtonClick}
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
    isFiltered,
    openFilters,
  } = props;

  // TODO currently, when sort is empty, API returns sort by timestamp ASC
  // Factor this in by detecting this and applying the MUI asc sort icon on timestamp header
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
          <Tooltip
            enterDelay={400}
            enterNextDelay={400}
            title={
              <div>
                {channelInfo?.name && (
                  <Typography>
                    System Name: {channelInfo.systemName}{' '}
                  </Typography>
                )}
                <Typography>Description: {channelInfo?.description}</Typography>
                {channelInfo && isChannelMetadataScalar(channelInfo) && (
                  <Typography>Units: {channelInfo?.units}</Typography>
                )}
                {channelInfo && isChannelMetadataWaveform(channelInfo) && (
                  <>
                    <Typography>X Units: {channelInfo?.x_units}</Typography>
                    <Typography>Y Units: {channelInfo?.y_units}</Typography>
                  </>
                )}
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
            // 33 - enough space for menu icon + divider
            // 57 including the filter icon
            width: isFiltered ? 61 : 33,
            justifyContent: 'space-between',
            zIndex: 0,
            backgroundColor: (theme) => theme.palette.background.default,
          }}
        >
          {isFiltered && (
            <div>
              <IconButton
                aria-label="open filters"
                id={`${dataKey}-filter-icon`}
                onClick={() => openFilters(dataKey)}
                size="small"
                sx={{ left: 5 }}
              >
                <FilterAlt fontSize="inherit" />
              </IconButton>
            </div>
          )}
          <ColumnMenu
            dataKey={dataKey}
            onClose={onClose}
            wordWrap={wordWrap}
            onToggleWordWrap={onToggleWordWrap}
          />
          <Divider
            {...resizerProps}
            // contentEditable makes it so that react-beautiful-dnd won't listen to drag
            // events from this component. Also need to add tabIndex -1 to make it not
            // focusable as it looks like a text editor if focused on!
            contentEditable
            tabIndex={-1}
            orientation="vertical"
            flexItem
            sx={{
              height: '100%',
              borderRightWidth: 5,
              cursor: 'col-resize',
            }}
          />
        </Box>
      </TableCell>
    );
  };

  // Timestamp column must not be reordered
  return dataKey.toUpperCase() !== 'TIMESTAMP' ? (
    <Draggable draggableId={dataKey} index={index}>
      {(provided) => <TableCellContent provided={provided} />}
    </Draggable>
  ) : (
    <TableCellContent />
  );
};

DataHeader.displayName = 'DataHeader';

export default DataHeader;
