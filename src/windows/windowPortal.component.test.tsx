import React from 'react';
import { render } from '@testing-library/react';
import WindowPortalWithTheme, { WindowPortal } from './windowPortal.component';
import type { WindowPortalProps } from './windowPortal.component';
import { DEFAULT_WINDOW_VARS } from '../app.types';
import { createTheme, ThemeProvider } from '@mui/material/styles';

describe('Window portal component', () => {
  const TestComponent = () => <div id="test">Test</div>;
  let props: WindowPortalProps;
  const onClose = jest.fn();
  const mockAddEventListener = jest.fn();
  const mockRemoveEventListener = jest.fn();
  const mockWindowClose = jest.fn();
  let newDocument: Document;
  const theme = createTheme({ palette: { mode: 'dark' } });

  Object.defineProperty(window, 'open', {
    value: () => {
      return {
        document: newDocument,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        close: mockWindowClose,
      };
    },
  });

  const createView = () =>
    render(
      <WindowPortal {...props} theme={theme}>
        <TestComponent />
      </WindowPortal>
    );

  beforeEach(() => {
    newDocument = global.window.document.implementation.createHTMLDocument();

    props = {
      title: 'test title',
      onClose,
      ...DEFAULT_WINDOW_VARS,
    };
  });

  it('renders child in separate document and initialises event listeners & scripts, and handles unmounting correctly', () => {
    const { unmount } = createView();

    expect(newDocument.body).toMatchSnapshot();
    expect(mockAddEventListener).toHaveBeenCalledTimes(1);
    expect(mockAddEventListener).toHaveBeenCalledWith('beforeunload', onClose);
    expect(newDocument.title).toEqual('OperationsGateway Plot - test title');

    /* eslint-disable testing-library/no-node-access */
    const scriptTags = newDocument.querySelectorAll('script');
    expect(scriptTags).toHaveLength(5);
    expect(scriptTags[0].src).toContain('Chart.js');
    expect(scriptTags[1].src).toContain('hammer.js');
    expect(scriptTags[2].src).toContain('chartjs-plugin-zoom');
    expect(scriptTags[3].src).toContain('chartjs-adapter-date-fns');

    expect(scriptTags[4].type).toEqual('text/javascript');
    expect(scriptTags[4].textContent).toBeTruthy();
    /* eslint-enable testing-library/no-node-access */

    unmount();
    expect(mockWindowClose).toHaveBeenCalled();
  });

  it('changes title on title prop change', () => {
    const { rerender } = createView();

    rerender(
      <WindowPortal {...props} title="new test title" theme={theme}>
        <TestComponent />
      </WindowPortal>
    );

    expect(newDocument.title).toEqual(
      'OperationsGateway Plot - new test title'
    );
  });

  it('removed and re-adds event listeners onClose prop change', () => {
    const { rerender } = createView();

    const newMockOnClose = jest.fn();

    rerender(
      <WindowPortal {...props} onClose={newMockOnClose} theme={theme}>
        <TestComponent />
      </WindowPortal>
    );

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'beforeunload',
      onClose
    );
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'beforeunload',
      newMockOnClose
    );
  });

  it('changes colour theme on theme prop change', () => {
    const { rerender } = createView();

    const newTheme = createTheme({
      palette: {
        mode: 'light',
      },
    });

    rerender(
      <WindowPortal {...props} theme={newTheme}>
        <TestComponent />
      </WindowPortal>
    );

    // eslint-disable-next-line testing-library/no-node-access
    expect(newDocument.getElementById('themeElement')?.dataset.mode).toEqual(
      'light'
    );
  });

  it('renders with theme inherited from ThemeProvider', () => {
    render(
      <ThemeProvider theme={theme}>
        <WindowPortalWithTheme {...props}>
          <TestComponent />
        </WindowPortalWithTheme>
      </ThemeProvider>
    );

    expect(newDocument.body).toMatchSnapshot();
  });
});
