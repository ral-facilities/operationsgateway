import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React from 'react';
import { useChannelSummary } from '../api/channels';
import {
  FullChannelMetadata,
  isChannelMetadataScalar,
  isChannelMetadataWaveform,
} from '../app.types';
import {
  renderImage,
  renderTimestamp,
} from '../table/cellRenderers/cellContentRenderers';

type ChannelMetadataPanelProps = {
  displayedChannel: FullChannelMetadata | undefined;
};

const Heading = (props: React.ComponentProps<typeof Typography>) => {
  const { children, ref, ...restProps } = props;
  return (
    <Typography
      variant="body1"
      component="h3"
      gutterBottom
      sx={{ fontWeight: 'bold' }}
      {...restProps}
    >
      {children}
    </Typography>
  );
};
const Body = (props: React.ComponentProps<typeof Typography>) => {
  const { children, ...restProps } = props;
  return (
    <Typography variant="body2" gutterBottom {...restProps}>
      {props.children}
    </Typography>
  );
};

const ChannelMetadataPanel = (props: ChannelMetadataPanelProps) => {
  const { displayedChannel } = props;

  const { data: channelSummary } = useChannelSummary(
    displayedChannel?.systemName
  );

  if (displayedChannel) {
    return (
      <>
        <Heading>
          {displayedChannel?.name ?? displayedChannel.systemName}
        </Heading>
        {displayedChannel?.name && (
          <Body>System name: {displayedChannel.systemName}</Body>
        )}
        {displayedChannel?.description && (
          <Body>{displayedChannel.description}</Body>
        )}
        <Body>Channel type: {displayedChannel.type}</Body>
        {isChannelMetadataScalar(displayedChannel) &&
          displayedChannel.units && (
            <Body>Units: {displayedChannel.units}</Body>
          )}
        {isChannelMetadataWaveform(displayedChannel) && (
          <>
            <Body gutterBottom={false}>
              X Units: {displayedChannel.x_units}
            </Body>
            <Body>Y Units: {displayedChannel.y_units}</Body>
          </>
        )}
        {displayedChannel?.historical && (
          <Body fontWeight="bold">This channel is historical</Body>
        )}
        {channelSummary && (
          <>
            <Divider />
            <Typography
              variant="body2"
              component="h4"
              gutterBottom
              sx={{ fontWeight: 'bold', paddingTop: 1 }}
            >
              Data Summary
            </Typography>
            <Body gutterBottom={false}>
              First data date: {renderTimestamp(channelSummary.first_date)}
            </Body>
            <Body>
              Most recent data date:{' '}
              {renderTimestamp(channelSummary.most_recent_date)}
            </Body>
            <Typography
              variant="body2"
              component="h5"
              gutterBottom
              sx={{ fontWeight: 'bold', paddingTop: 1 }}
            >
              Recent Data
            </Typography>
            <TableContainer>
              <Table aria-label="recent data" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Data</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {channelSummary.recent_sample.map((sample) => {
                    const [timestamp, data] = Object.entries(sample)[0];
                    const formattedTimestamp = renderTimestamp(timestamp);
                    return (
                      <TableRow
                        key={formattedTimestamp}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {formattedTimestamp}
                        </TableCell>
                        <TableCell>
                          {isChannelMetadataScalar(displayedChannel)
                            ? data
                            : renderImage(
                                data as string,
                                `${
                                  displayedChannel?.name ??
                                  displayedChannel.systemName
                                } ${
                                  displayedChannel.type
                                } at ${formattedTimestamp}`
                              )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </>
    );
  } else {
    return (
      <>
        <Heading>Data Channels Help</Heading>
        <Body>
          There are two options to locate a channel. You can either search or
          use the navigation on the left.
        </Body>
        <Body>
          Channel metadata can also be viewed. This can be displayed by clicking
          a channel name
        </Body>
      </>
    );
  }
};

export default ChannelMetadataPanel;
