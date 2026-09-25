import { Draggable, DraggableProvided } from '@hello-pangea/dnd';
import Close from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import Feed from '@mui/icons-material/Feed';
import FilterAlt from '@mui/icons-material/FilterAlt';
import MoreVert from '@mui/icons-material/MoreVert';
import WrapText from '@mui/icons-material/WrapText';
import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  SxProps,
  TableCell,
  TableSortLabel,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  FullChannelMetadata,
  isChannelMetadataFloatImage,
  isChannelMetadataImage,
  isChannelMetadataScalar,
  isChannelMetadataVector,
  isChannelMetadataWaveform,
  Order,
} from '../../app.types';
import ExportChannelColumn from '../../export/exportChannelColumn.component';

export interface DataHeaderProps {
  disableSort?: boolean;
  dataKey: string;
  sort: { [column: string]: Order };
  sx?: SxProps<Theme>;
  onSort: (column: string, order: Order | null) => void;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  resizeHandler: (event: unknown) => void;
  onClose: (column: string) => void;
  onToggleWordWrap: (column: string) => void;
  index: number;
  channelInfo?: FullChannelMetadata;
  wordWrap: boolean;
  isFiltered: boolean;
  openFilters: (headerName: string) => void;
  removable: boolean;
  reorderable: boolean;
}

export interface ColumnMenuProps {
  dataKey: string;
  onClose: (column: string) => void;
  onToggleWordWrap: (column: string) => void;
  wordWrap: boolean;
  channelInfo?: FullChannelMetadata;
  removable: boolean;
}

const ColumnMenu = (props: ColumnMenuProps): React.ReactElement => {
  const {
    dataKey,
    onClose,
    onToggleWordWrap,
    wordWrap,
    channelInfo,
    removable,
  } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOptionsButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const [openExportDialogue, setOpenExportDialogue] =
    React.useState<boolean>(false);
  const isWaveformOrImage =
    !!channelInfo &&
    (isChannelMetadataWaveform(channelInfo) ||
      isChannelMetadataImage(channelInfo) ||
      isChannelMetadataFloatImage(channelInfo) ||
      isChannelMetadataVector(channelInfo));
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
        slotProps={{
          list: {
            'aria-labelledby': `${dataKey}-menu-button`,
            dense: true,
          },
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
        {isWaveformOrImage && (
          <MenuItem
            onClick={() => {
              setOpenExportDialogue(true);
              handleClose();
            }}
          >
            <ListItemIcon>
              <DownloadIcon />
            </ListItemIcon>
            <ListItemText>Export</ListItemText>
          </MenuItem>
        )}
        {removable && (
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
      {channelInfo && (
        <ExportChannelColumn
          open={openExportDialogue}
          onClose={() => setOpenExportDialogue(false)}
          channelInfo={channelInfo}
        />
      )}
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
    label,
    resizeHandler,
    onClose,
    index,
    channelInfo,
    wordWrap,
    onToggleWordWrap,
    isFiltered,
    openFilters,
    removable,
    reorderable,
  } = props;

  // TODO currently, when sort is empty, API returns sort by timestamp ASC
  // Factor this in by detecting this and applying the MUI asc sort icon on timestamp header
  const currSortDirection = sort[dataKey];

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
          display="flex"
          sx={{
            // overflow: 'hidden',
            flex: 1,
            minWidth: 0,
          }}
          onMouseDown={(event) => {
            // Middle mouse button can also fire onClose
            if (removable && event.button === 1) {
              event.preventDefault();
              onClose(dataKey);
            }
          }}
        >
          <Box
            marginRight={1}
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {Icon ?? <Feed />}
          </Box>
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
            height: '100%',
            alignItems: 'center',
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
            channelInfo={channelInfo}
            removable={removable}
          />
          <Divider
            onMouseDown={resizeHandler}
            onTouchStart={resizeHandler}
            // contentEditable makes it so that @hello-pangea/dnd won't listen to drag
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

  // sticky channels can't be re-ordered
  return reorderable ? (
    <Draggable draggableId={dataKey} index={index}>
      {(provided) => <TableCellContent provided={provided} />}
    </Draggable>
  ) : (
    <TableCellContent />
  );
};

DataHeader.displayName = 'DataHeader';

export default DataHeader;
