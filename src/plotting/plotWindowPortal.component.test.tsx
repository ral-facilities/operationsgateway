import React from 'react';
import { render } from '@testing-library/react';
import PlotWindowPortal from './plotWindowPortal.component';

describe('Plot Window component', () => {
  const TestComponent = () => <div id="test">Test</div>;
  const onClose = jest.fn();
  const mockAddEventListener = jest.fn();
  const mockRemoveEventListener = jest.fn();
  const mockClearTimeout = jest.fn();
  const mockSetTimeout = (func, timeout) => {
    func();
  };
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
        clearTimeout: mockClearTimeout,
        setTimeout: mockSetTimeout,
      };
    },
  });

  const createView = () =>
    render(
      <PlotWindowPortal onClose={onClose} title="test title">
        <TestComponent />
      </PlotWindowPortal>
    );

  it('renders child in separate document and initialises event listeners, and handles unmounting correctly', () => {
    const { unmount } = createView();

    expect(newDocument.body).toMatchSnapshot();
    expect(mockAddEventListener).toHaveBeenCalledTimes(2);
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
    expect(mockAddEventListener).toHaveBeenCalledWith('beforeunload', onClose);
    expect(newDocument.title).toEqual('OperationsGateway Plot - test title');

    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
    expect(mockWindowClose).toHaveBeenCalled();
  });

  it('changes title on title prop change', () => {
    const { rerender } = createView();

    rerender(
      <PlotWindowPortal onClose={onClose} title="new test title">
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
      <PlotWindowPortal onClose={newMockOnClose} title="test title">
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

  it('sends a resize event to the main document on popup resize', () => {
    let resizeHandler;
    mockAddEventListener.mockImplementation((event, handler) => {
      if (event === 'resize') {
        resizeHandler = handler;
      }
    });

    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

    createView();

    resizeHandler();

    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    expect(dispatchEventSpy.mock.calls[0][0].type).toBe(
      'resize OperationsGateway Plot - test title'
    );
  });
});
