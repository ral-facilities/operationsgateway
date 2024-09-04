import { MoreVert } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import React from 'react';
import { useClickOutside } from '../../../hooks';
import type { MoreOptionsProps } from './moreOptionsBox.component';
import MoreOptionsBox from './moreOptionsBox.component';

const MoreOptionsToggle = (props: MoreOptionsProps) => {
  const channelName = props.channel.displayName ?? props.channel.name;

  const popover = React.useRef<HTMLDivElement | null>(null);
  const parent = React.useRef<HTMLDivElement | null>(null);
  const [isOpen, toggle] = React.useState(false);

  const close = React.useCallback(() => toggle(false), []);
  // use parent node which is always mounted to get the document to attach event listeners to
  useClickOutside(popover, close, parent.current?.ownerDocument);

  return (
    <Box sx={{ position: 'relative' }} ref={parent}>
      <IconButton
        aria-label={`More options for ${channelName}`}
        size="small"
        sx={{ padding: '1px', margin: '-1px 1px' }}
        onClick={() => toggle(!isOpen)}
      >
        <MoreVert />
      </IconButton>

      {isOpen && (
        <Box
          role="dialog"
          sx={{
            position: 'absolute',
            bottom: -18,
            right: 30,
            zIndex: 1,
            backgroundColor: 'background.paper',
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
