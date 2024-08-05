import React from 'react';
import { sessionSelector } from './state/hooks';
import { WindowContext } from './windows/windowContext';

// from react-colorful PopoverPicker demo :https://codesandbox.io/s/opmco?file=/src/PopoverPicker.js
// Improved version of https://usehooks.com/useOnClickOutside/
export const useClickOutside = (
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

export const useUpdateWindowPositions = (): ((
  state: ReturnType<typeof sessionSelector>
) => ReturnType<typeof sessionSelector>) => {
  const windowsRef = React.useContext(WindowContext);

  return (state) => {
    const sessionState = JSON.parse(JSON.stringify(state));
    Object.keys(sessionState.windows).forEach((id) => {
      const ref = windowsRef.current[id];
      if (ref)
        sessionState.windows[id] = {
          ...sessionState.windows[id],
          screenX:
            ref.current?.state?.window?.screenX ??
            sessionState.windows[id].screenX,
          screenY:
            ref.current?.state?.window?.screenY ??
            sessionState.windows[id].screenY,
          innerHeight:
            ref.current?.state?.window?.innerHeight ??
            sessionState.windows[id].innerHeight,
          innerWidth:
            ref.current?.state?.window?.innerWidth ??
            sessionState.windows[id].innerWidth,
        };
    });
    Object.keys(sessionState.plots).forEach((id) => {
      const ref = windowsRef.current[id];
      if (ref)
        sessionState.plots[id] = {
          ...sessionState.plots[id],
          screenX:
            ref.current?.state?.window?.screenX ??
            sessionState.plots[id].screenX,
          screenY:
            ref.current?.state?.window?.screenY ??
            sessionState.plots[id].screenY,
          innerHeight:
            ref.current?.state?.window?.innerHeight ??
            sessionState.plots[id].innerHeight,
          innerWidth:
            ref.current?.state?.window?.innerWidth ??
            sessionState.plots[id].innerWidth,
        };
    });

    return sessionState;
  };
};
