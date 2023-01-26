import { Typography } from '@mui/material';
import React from 'react';
import {
  FullChannelMetadata,
  isChannelMetadataScalar,
  isChannelMetadataWaveform,
} from '../app.types';

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
const Body = (
  props: React.ComponentProps<typeof Typography> & { bottomMargin?: boolean }
) => (
  <Typography
    variant="body2"
    gutterBottom={
      typeof props.bottomMargin !== undefined ? props.bottomMargin : true
    }
  >
    {props.children}
  </Typography>
);

const ChannelMetadataPanel = (props: ChannelMetadataPanelProps) => {
  const { displayedChannel } = props;

  if (displayedChannel) {
    return (
      <>
        <Heading>
          {displayedChannel?.name ?? displayedChannel.systemName}
        </Heading>
        {displayedChannel?.description ?? (
          <Body>{displayedChannel.description}</Body>
        )}
        {isChannelMetadataScalar(displayedChannel) &&
          displayedChannel.units && (
            <Body>Units: {displayedChannel.units}</Body>
          )}
        {isChannelMetadataWaveform(displayedChannel) && (
          <>
            <Body bottomMargin={false}>
              X Units: {displayedChannel.x_units}
            </Body>
            <Body>Y Units: {displayedChannel.y_units}</Body>
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
