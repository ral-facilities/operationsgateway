import React from 'react';
import { Box, IconButton } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import MoreOptionsBox from './moreOptionsBox.component';
import type { MoreOptionsProps } from './moreOptionsBox.component';
import { useClickOutside } from '../../../hooks';

const MoreOptionsToggle = (props: MoreOptionsProps) => {
  const { name: channelName } = props.channel;

  const popover = React.useRef<HTMLDivElement | null>(null);
  const parent = React.useRef<HTMLDivElement | null>(null);
  const [isOpen, toggle] = React.useState(false);

  const close = React.useCallback(() => toggle(false), []);
  // use parent node which is always mounted to get the document to attach event listeners to
  useClickOutside(popover, close, parent.current?.ownerDocument);

  return (
    <Box sx={{ position: 'relative' }} ref={parent}>
      <IconButton
        color="primary"
        aria-label={`More options for ${channelName}`}
        size="small"
        sx={{ paddingTop: '0', paddingBottom: '0' }}
        onClick={() => toggle(!isOpen)}
      >
        <MoreVert sx={{ color: 'black' }} />
      </IconButton>

      {isOpen && (
        <Box
          role="dialog"
          sx={{
            position: 'absolute',
            top: -95,
            right: 30,
            zIndex: 1,
            backgroundColor: '#ffffff',
            width: 150,
          }}
          ref={popover}
        >
          <MoreOptionsBox {...props} />
        </Box>
      )}
    </Box>
  );
};

export default MoreOptionsToggle;
