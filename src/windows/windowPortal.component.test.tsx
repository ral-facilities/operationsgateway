import { render } from '@testing-library/react';
import React from 'react';
import { DEFAULT_WINDOW_VARS } from '../app.types';
import type { WindowPortalProps } from './windowPortal.component';
import WindowPortal from './windowPortal.component';

describe('Window portal component', () => {
  const TestComponent = () => <div id="test">Test</div>;
  let props: Omit<WindowPortalProps, 'children'>;
  const onClose = vi.fn();
  const mockAddEventListener = vi.fn();
  const mockRemoveEventListener = vi.fn();
  const mockWindowClose = vi.fn();
  let newDocument: Document;

  Object.defineProperty(window, 'open', {
    value: vi.fn(() => {
      return {
        document: newDocument,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        close: mockWindowClose,
      };
    }),
  });

  const createView = () =>
    render(
      <WindowPortal {...props}>
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

    expect(window.open).toHaveBeenCalledWith(
      '',
      '',
      `innerWidth=${props.innerWidth},innerHeight=${props.innerHeight},left=${props.screenX},top=${props.screenY}`
    );

    expect(newDocument.body).toMatchSnapshot();
    expect(mockAddEventListener).toHaveBeenCalledTimes(1);
    expect(mockAddEventListener).toHaveBeenCalledWith('unload', onClose);
    expect(newDocument.title).toEqual('OperationsGateway Plot - test title');

    /* eslint-disable testing-library/no-node-access */
    const scriptTags = newDocument.querySelectorAll('script');
    expect(scriptTags).toHaveLength(2);
    expect(scriptTags[0].src).toContain('plotly.js');

    expect(scriptTags[1].type).toEqual('text/javascript');
    expect(scriptTags[1].textContent).toBeTruthy();
    /* eslint-enable testing-library/no-node-access */

    unmount();
    expect(mockWindowClose).toHaveBeenCalled();
  });

  it('returns the window reference using getWindow', () => {
    const ref = React.createRef<WindowPortal>();
    const { unmount } = render(
      <WindowPortal {...props} ref={ref}>
        <TestComponent />
      </WindowPortal>
    );

    // Access the WindowPortal instance via the ref and call getWindow
    const windowRef = ref.current?.getWindow();

    expect(windowRef).toBeDefined();

    unmount();
  });

  it('handles negative x & Y window co-ords correctly', () => {
    props = {
      ...props,
      screenX: -100,
      screenY: -100,
    };
    createView();

    expect(window.open).toHaveBeenCalledWith(
      '',
      '',
      `innerWidth=${props.innerWidth},innerHeight=${props.innerHeight},left=${props.screenX - props.innerWidth},top=${props.screenY - props.innerHeight}`
    );
  });

  it('changes title on title prop change', () => {
    const { rerender } = createView();

    rerender(
      <WindowPortal {...props} title="new test title">
        <TestComponent />
      </WindowPortal>
    );

    expect(newDocument.title).toEqual(
      'OperationsGateway Plot - new test title'
    );
  });

  it('removed and re-adds event listeners onClose prop change', () => {
    const { rerender } = createView();

    const newMockOnClose = vi.fn();

    rerender(
      <WindowPortal {...props} onClose={newMockOnClose}>
        <TestComponent />
      </WindowPortal>
    );

    expect(mockRemoveEventListener).toHaveBeenCalledWith('unload', onClose);
    expect(mockAddEventListener).toHaveBeenCalledWith('unload', newMockOnClose);
  });

  it('removed and re-adds event listeners onBeforeClose prop change', () => {
    const mockOnBeforeClose = vi.fn();
    props.onBeforeClose = mockOnBeforeClose;
    const { rerender } = createView();

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'beforeunload',
      mockOnBeforeClose
    );

    const newMockOnBeforeClose = vi.fn();

    rerender(
      <WindowPortal {...props} onBeforeClose={newMockOnBeforeClose}>
        <TestComponent />
      </WindowPortal>
    );

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'beforeunload',
      mockOnBeforeClose
    );
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'beforeunload',
      newMockOnBeforeClose
    );
  });
});
