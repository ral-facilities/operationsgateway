import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import PlotWindow from './plotWindow.component';
import userEvent from '@testing-library/user-event';
import { renderComponentWithProviders } from '../setupTests';

jest.mock('./plotWindowPortal.component', () => ({ children }) => (
  // @ts-ignore
  <mock-PlotWindowPortal>{children}</mock-PlotWindowPortal>
));

jest.mock('./plot.component', () => () => (
  // @ts-ignore
  <mock-Plot data-testid="mock-plot" />
));

describe('Plot Window component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createView = () => {
    return renderComponentWithProviders(
      <PlotWindow onClose={jest.fn()} untitledTitle="untitled" />
    );
  };

  it('renders plot window correctly with settings pane both open and closed', async () => {
    const user = userEvent.setup();
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    createView();

    await user.click(screen.getByRole('button', { name: 'close settings' }));

    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    expect(dispatchEventSpy.mock.calls[0][0].type).toBe(
      'resize OperationsGateway Plot - untitled'
    );
    dispatchEventSpy.mockClear();
    // expect plot & settings button to be visible but not settings panel
    // use waitFor to account for drawer animations
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'close settings' })
      ).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('mock-plot')).toBeVisible();
    expect(screen.getByRole('button', { name: 'open settings' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'open settings' }));

    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    expect(dispatchEventSpy.mock.calls[0][0].type).toBe(
      'resize OperationsGateway Plot - untitled'
    );

    // expect plot & settings panel to be visible but not settings button
    // use waitFor to account for drawer animations
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'open settings' })
      ).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('mock-plot')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'close settings' })
    ).toBeVisible();
  });
});
