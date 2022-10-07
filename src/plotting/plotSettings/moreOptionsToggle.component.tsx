import React from 'react';
import { Box, IconButton } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import MoreOptions from './moreOptions.component';

import type { MoreOptionsProps } from './moreOptions.component';

// from react-colorful PopoverPicker demo :https://codesandbox.io/s/opmco?file=/src/PopoverPicker.js

// Improved version of https://usehooks.com/useOnClickOutside/
const useClickOutside = (
  ref: React.MutableRefObject<HTMLDivElement | null>,
  handler: (event: Event) => void,
  customDocument?: Document
) => {
  React.useEffect(() => {
    let startedInside = false;
    let startedWhenMounted = false;

    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if `mousedown` or `touchstart` started inside ref element
      if (startedInside || !startedWhenMounted) return;
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as HTMLElement))
        return;

      handler(event);
    };

    const validateEventStart = (event: MouseEvent | TouchEvent) => {
      startedWhenMounted = Boolean(ref.current);
      startedInside = Boolean(
        ref.current && ref.current.contains(event.target as HTMLElement)
      );
    };

    const eventDocument = customDocument ? customDocument : document;

    eventDocument.addEventListener('mousedown', validateEventStart);
    eventDocument.addEventListener('touchstart', validateEventStart);
    eventDocument.addEventListener('click', listener);

    return () => {
      eventDocument.removeEventListener('mousedown', validateEventStart);
      eventDocument.removeEventListener('touchstart', validateEventStart);
      eventDocument.removeEventListener('click', listener);
    };
  }, [ref, handler, customDocument]);
};

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
            borderRadius: 9,
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
            '& .react-colorful': {
              height: 125,
              width: 125,
            },
            '& .react-colorful__saturation': {
              borderBottom: '5px solid #000',
            },
            '& .react-colorful__hue': {
              height: 16,
            },
            '& .react-colorful__saturation-pointer, .react-colorful__hue-pointer':
              {
                height: 16,
                width: 16,
              },
          }}
          ref={popover}
        >
          <MoreOptions {...props} />
        </Box>
      )}
    </Box>
  );
};

export default MoreOptionsToggle;
