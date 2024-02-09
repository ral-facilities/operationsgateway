import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Box, Switch } from '@mui/material';
import { useClickOutside } from '../../../hooks';

type ColourPickerProps = {
  channelName: string;
  colour: string;
  changeColour: (colour: string) => void;
  marker?: boolean;
  sameAsLine?: boolean;
};

const ColourPicker = (props: ColourPickerProps) => {
  const { channelName, colour, changeColour, marker, sameAsLine } = props;
  const popover = React.useRef<HTMLDivElement | null>(null);
  const parent = React.useRef<HTMLDivElement | null>(null);
  const [isOpen, toggle] = React.useState(false);
  const [lockColour, toggleLockColour] = React.useState(sameAsLine);

  const close = React.useCallback(() => toggle(false), []);
  // use parent node which is always mounted to get the document to attach event listeners to
  useClickOutside(popover, close, parent.current?.ownerDocument);

  return (
    <Box sx={{ position: 'relative' }} ref={parent}>
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '8px',
          border: '3px solid #fff',
          boxShadow:
            '0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          backgroundColor: colour,
        }}
        component="button"
        onClick={() => toggle(!isOpen)}
        aria-label={`Pick ${channelName} colour`}
        aria-haspopup="dialog"
      />

      {isOpen && (
        <Box
          role="dialog"
          sx={{
            backgroundColor: '#fff',
            position: 'absolute',
            top: -95,
            right: 30,
            zIndex: 1,
            borderRadius: 2,
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
          <HexColorPicker
            color={colour}
            onChange={(newColour: string) => {
              changeColour(newColour);
              toggleLockColour(false);
            }}
          />
          {marker && (
            <Box
              sx={{
                height: 24,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Switch
                size="small"
                checked={lockColour}
                aria-label={`toggle ${channelName} marker colour same as line`}
                sx={{ marginLeft: 0 }}
                onChange={() => {
                  toggleLockColour(!lockColour);
                  lockColour ? changeColour(colour) : changeColour('');
                }}
              />
              Same as line
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ColourPicker;
