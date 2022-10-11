import React from 'react';

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
