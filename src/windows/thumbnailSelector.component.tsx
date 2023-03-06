import { List, ListItem, TablePagination, Tooltip } from '@mui/material';
import { Stack } from '@mui/system';
import React from 'react';
import { useRecordCount, useThumbnails } from '../api/records';
import { isChannelImage, isChannelWaveform } from '../app.types';
import { useAppSelector } from '../state/hooks';
import {
  selectQueryParams,
  selectSearchParams,
} from '../state/slices/searchSlice';
import {
  renderTimestamp,
  TraceOrImageThumbnail,
} from '../table/cellRenderers/cellContentRenderers';

interface ThumbnailSelectorProps {
  channelName: string;
  changeRecordId: (recordId: string) => void;
}

const ThumbnailSelector = (props: ThumbnailSelectorProps) => {
  const { channelName, changeRecordId } = props;

  const { page: tablePage, resultsPerPage: tableResultsPerPage } =
    useAppSelector(selectQueryParams);
  const { maxShots } = useAppSelector(selectSearchParams);

  const [page, setPage] = React.useState(tablePage);
  const [resultsPerPage, setResultsPerPage] =
    React.useState(tableResultsPerPage);

  const { data: thumbnailsCount } = useRecordCount();
  const { data: thumbnails } = useThumbnails(channelName, page, resultsPerPage);

  return (
    <Stack
      direction="column"
      justifyContent="space-between"
      sx={{ minWidth: 150, maxWidth: 150 }}
    >
      <List
        disablePadding
        sx={{
          overflow: 'auto',
          maxHeight: `calc(100vh - 58px - 38px)`,
        }}
      >
        {thumbnails?.map((thumbnailRecord) => {
          const channelData = thumbnailRecord.channels[channelName];

          if (typeof channelData === 'undefined') return null;

          return (
            <ListItem key={thumbnailRecord._id}>
              <Tooltip
                enterDelay={200}
                enterNextDelay={200}
                title={`Timestamp: ${renderTimestamp(
                  thumbnailRecord.metadata.timestamp
                )}`}
                arrow
                PopperProps={{ disablePortal: true }}
              >
                <TraceOrImageThumbnail
                  base64Data={
                    isChannelImage(channelData) ||
                    isChannelWaveform(channelData)
                      ? channelData.thumbnail
                      : undefined
                  }
                  alt={`${channelName} trace for timestamp ${thumbnailRecord.metadata.timestamp}`}
                  style={{ margin: 'auto' }}
                  onClick={() => changeRecordId(thumbnailRecord._id)}
                />
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
      <TablePagination
        component="div"
        count={
          typeof thumbnailsCount !== 'undefined'
            ? maxShots > thumbnailsCount
              ? thumbnailsCount
              : maxShots
            : -1
        }
        onPageChange={(e, page) => {
          setPage(page);
        }}
        page={page}
        rowsPerPage={resultsPerPage}
        labelRowsPerPage="Page size"
        onRowsPerPageChange={(event) => {
          setResultsPerPage(parseInt(event.target.value));
        }}
        rowsPerPageOptions={maxShots === 50 ? [10, 25, 50] : [10, 25, 50, 100]}
        padding="none"
        size="small"
        sx={{
          '.MuiTablePagination-toolbar': {
            flexWrap: 'wrap',
            padding: 0,
            paddingLeft: 1,
          },
          '.MuiTablePagination-spacer': {
            display: 'none',
          },
          '.MuiTablePagination-actions': {
            marginLeft: '0px !important',
          },
          '.MuiTablePagination-displayedRows': {
            margin: '5px 0',
            fontSize: '0.8rem',
            letterSpacing: 'unset',
          },
          '.MuiTablePagination-selectLabel': {
            margin: '5px 0',
            fontSize: '0.8rem',
            letterSpacing: 'unset',
          },
        }}
        SelectProps={{
          sx: {
            marginLeft: '0px',
            marginRight: '0px',
          },
        }}
        nextIconButtonProps={{
          size: 'small',
          sx: {
            padding: 0,
          },
        }}
        backIconButtonProps={{
          size: 'small',
          sx: {
            padding: 0,
          },
        }}
      />
    </Stack>
  );
};

export default ThumbnailSelector;
