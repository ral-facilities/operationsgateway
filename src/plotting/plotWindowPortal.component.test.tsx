import React from 'react';
import { render } from '@testing-library/react';
import PlotWindowPortal from './plotWindowPortal.component';
import type { PlotWindowPortalProps } from './plotWindowPortal.component';
import { DEFAULT_WINDOW_VARS } from '../state/slices/plotSlice';

describe('Plot Window component', () => {
  const TestComponent = () => <div id="test">Test</div>;
  let props: PlotWindowPortalProps;
  const onClose = jest.fn();
  const mockAddEventListener = jest.fn();
  const mockRemoveEventListener = jest.fn();
  const mockWindowClose = jest.fn();
  const newDocument =
    global.window.document.implementation.createHTMLDocument();

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
      <PlotWindowPortal {...props}>
        <TestComponent />
      </PlotWindowPortal>
    );

  beforeEach(() => {
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
      <PlotWindowPortal {...props} title="new test title">
        <TestComponent />
      </PlotWindowPortal>
    );

    expect(newDocument.title).toEqual(
      'OperationsGateway Plot - new test title'
    );
  });

  it('removed and re-adds event listeners onClose prop change', () => {
    const { rerender } = createView();

    const newMockOnClose = jest.fn();

    rerender(
      <PlotWindowPortal {...props} onClose={newMockOnClose}>
        <TestComponent />
      </PlotWindowPortal>
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
});
