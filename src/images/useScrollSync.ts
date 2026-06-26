import React, { useCallback, useLayoutEffect, useRef } from 'react';

export function useScrollSync(
  refs: React.MutableRefObject<HTMLElement | null>[],
  scrollDirection: 'x' | 'y' | 'both'
) {
  const timeoutId = useRef<number>();
  const handleScroll: EventListener = useCallback(
    (event) => {
      const syncedRefs = refs.filter((ref) => ref.current !== event.target);
      const targetScrollLeft = (event?.target as HTMLElement)?.scrollLeft;
      const targetScrollTop = (event?.target as HTMLElement)?.scrollTop;

      clearTimeout(timeoutId.current);

      syncedRefs.forEach((ref) => {
        removeEvent(ref);
        if (ref.current) {
          ref.current.style.willChange = 'scroll-position';
          if (scrollDirection === 'x' || scrollDirection === 'both')
            ref.current.scrollLeft = targetScrollLeft;
          if (scrollDirection === 'y' || scrollDirection === 'both')
            ref.current.scrollTop = targetScrollTop;
        }
      });

      timeoutId.current = setTimeout(() => {
        syncedRefs.forEach((ref) => {
          addEvent(ref);
          if (ref.current) ref.current.style.willChange = '';
        });
      }, 100);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refs]
  );

  const addEvent = useCallback(
    (ref: React.MutableRefObject<HTMLElement | null>) => {
      ref.current?.addEventListener('scroll', handleScroll, {
        passive: true,
      });
    },
    [handleScroll]
  );

  const removeEvent = useCallback(
    (ref: React.MutableRefObject<HTMLElement | null>) => {
      ref.current?.removeEventListener('scroll', handleScroll);
    },
    [handleScroll]
  );

  useLayoutEffect(() => {
    refs.forEach(addEvent);
    return () => {
      clearTimeout(timeoutId.current);
      refs.forEach(removeEvent);
    };
  });
}
