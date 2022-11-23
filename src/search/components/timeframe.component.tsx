import React from 'react';
import { Box, Typography } from '@mui/material';
import { Schedule } from '@mui/icons-material';
import { useClickOutside } from '../../hooks';

const TimeframePopup = (): React.ReactElement => {
  return (
    <div>
      <Typography>Select your timeframe</Typography>
    </div>
  );
};

const Timeframe = (): React.ReactElement => {
  const popover = React.useRef<HTMLDivElement | null>(null);
  const parent = React.useRef<HTMLDivElement | null>(null);
  const [isOpen, toggle] = React.useState(false);

  const close = React.useCallback(() => toggle(false), []);
  // use parent node which is always mounted to get the document to attach event listeners to
  useClickOutside(popover, close, parent.current?.ownerDocument);

  return (
    <Box sx={{ position: 'relative' }} ref={parent}>
      <Box
        sx={{
          border: '1.5px solid',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'row',
          paddingRight: 5,
          cursor: 'pointer',
          overflow: 'hidden',
        }}
        onClick={() => toggle(!isOpen)}
      >
        <Schedule sx={{ fontSize: 40, padding: '10px 5px 0px 5px' }} />
        <div>
          <Typography noWrap>Timeframe</Typography>
          <Typography noWrap variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            0
          </Typography>
        </div>
      </Box>
      {isOpen && (
        <Box
          role="dialog"
          sx={{
            border: '1px solid',
            position: 'absolute',
            top: 55,
            zIndex: 2,
            backgroundColor: '#ffffff',
            width: 300,
          }}
          ref={popover}
        >
          <TimeframePopup />
        </Box>
      )}
    </Box>
  );
};

Timeframe.displayName = 'Timeframe';

export default Timeframe;
