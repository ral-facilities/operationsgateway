import React from 'react';
import {
  Divider,
  TableCell,
  Typography,
  SxProps,
  Grid,
  Theme,
} from '@mui/material';
import {
  FullChannelMetadata,
  FullScalarChannelMetadata,
} from '../../app.types';
import parse from 'html-react-parser';
import { roundNumber } from './cellContentRenderers';

export interface DataCellProps {
  sx?: SxProps<Theme>;
  dataKey: string;
  rowData: React.ReactNode;
  channelInfo?: FullChannelMetadata;
}

export const parseCellContents = (
  content: React.ReactNode,
  channelInfo: FullChannelMetadata
): React.ReactNode => {
  let parsedContent = content;

  if (
    (channelInfo.channel_dtype === 'image' ||
      channelInfo.channel_dtype === 'waveform') &&
    typeof parsedContent === 'string'
  ) {
    parsedContent = parse(parsedContent);
  } else {
    if (typeof parsedContent === 'number') {
      const scalarMetadata = channelInfo as FullScalarChannelMetadata;
      if (typeof scalarMetadata.significantFigures === 'number') {
        parsedContent = roundNumber(
          parsedContent,
          scalarMetadata.significantFigures,
          scalarMetadata.scientificNotation ?? false
        );
      }
    }
  }

  return parsedContent;
};

const DataCell = React.memo((props: DataCellProps): React.ReactElement => {
  const { sx, rowData, channelInfo } = props;

  const parsedContent = channelInfo
    ? parseCellContents(rowData, channelInfo)
    : rowData;

  return (
    <TableCell size="small" component="td" sx={sx} variant="body">
      <Grid container>
        <Grid item xs sx={{ overflow: 'hidden' }}>
          <Typography variant="body2" noWrap>
            {parsedContent}
          </Typography>
        </Grid>
        <Divider orientation="vertical" flexItem />
      </Grid>
    </TableCell>
  );
});

DataCell.displayName = 'DataCell';

export default DataCell;
