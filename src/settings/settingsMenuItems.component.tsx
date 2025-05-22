import { Divider, Typography } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom';
import ColourMapMenuItem from './colourMapMenuItem.component';
import VectorsMenuItem from './vectorsMenuItem.component';

const SettingsMenuItems = () => {
  const [menuOpen, setMenuOpen] = React.useState(
    document.body.querySelector('#settings ul, #mobile-overflow-menu ul') !==
      null
  );

  // observe body for new nodes (this is where #settings gets added)

  const observer = React.useMemo(
    () =>
      new MutationObserver(() => {
        if (
          document.body.querySelector('#settings ul, #mobile-overflow-menu ul')
        ) {
          setMenuOpen(true);
        } else {
          setMenuOpen(false);
        }
      }),
    []
  );

  React.useEffect(() => {
    if (!observer) return;
    observer.observe(document.body, {
      childList: true,
    });
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [observer]);

  if (!menuOpen) {
    return null;
  } else {
    return ReactDOM.createPortal(
      <>
        <Divider />
        <Typography sx={{ ml: 1 }} variant="h6">
          Images
        </Typography>
        <ColourMapMenuItem />
        <Divider />
        <Typography sx={{ ml: 1 }} variant="h6">
          Vectors
        </Typography>
        <VectorsMenuItem />
      </>,
      // we know this is not null from the mutation observer

      document.body.querySelector('#settings ul, #mobile-overflow-menu ul')!
    );
  }
};

export default SettingsMenuItems;
