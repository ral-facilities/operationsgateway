import React from 'react';
import { WindowPortal as WindowPortalClass } from '../windows/windowPortal.component';

export type WindowsRefType = Record<string, React.RefObject<WindowPortalClass>>;

// do some type fiddling to allow ref to be mutable, initialise and then remove the null type
const initWindowsRef: React.MutableRefObject<WindowsRefType | null> =
  React.createRef();
initWindowsRef.current = {};
const windowsRef = initWindowsRef as React.MutableRefObject<WindowsRefType>;

export const WindowContext = React.createContext(windowsRef);

export const WindowContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <WindowContext.Provider value={windowsRef}>
      {children}
    </WindowContext.Provider>
  );
};
