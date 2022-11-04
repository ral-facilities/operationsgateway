import React from 'react';
import { Box, Typography } from '@mui/material';
import { ScienceOutlined } from '@mui/icons-material';
import { useClickOutside } from '../../hooks';

const ExperimentPopup = (): React.ReactElement => {
  return (
    <div>
      <Typography>Select your experiment</Typography>
    </div>
  );
};

const Experiment = (): React.ReactElement => {
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
        }}
        onClick={() => toggle(!isOpen)}
      >
        <ScienceOutlined sx={{ fontSize: 40, padding: '10px 5px 0px 5px' }} />
        <div>
          <Typography>Experiment</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Select
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
          <ExperimentPopup />
        </Box>
      )}
    </Box>
  );
};

Experiment.displayName = 'Experiment';

export default Experiment;
