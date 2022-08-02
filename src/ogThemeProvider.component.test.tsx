import React from 'react';
import { createTheme, useTheme } from '@mui/material/styles';
import OGThemeProvider from './ogThemeProvider.component';
import { MicroFrontendId } from './app.types';
import { sendThemeOptions } from './state/scigateway.actions';
import { render, screen } from '@testing-library/react';

describe('DGThemeProvider', () => {
  it('receives and uses the theme options', () => {
    // Create a basic theme.
    const theme = createTheme({
      palette: {
        mode: 'dark',
      },
    });

    const TestComponent = () => {
      const theme = useTheme();
      return <div>mode: {theme.palette.mode}</div>;
    };

    const view = render(
      <OGThemeProvider>
        <TestComponent />
      </OGThemeProvider>
    );

    expect(screen.getByText('mode: light')).toBeInTheDocument();

    // Dispatch the theme options event.
    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: sendThemeOptions({ theme }),
      })
    );

    // Force rerender as the state will not update since
    // the theme options are from a global variable.
    view.rerender(
      <OGThemeProvider>
        <TestComponent />
      </OGThemeProvider>
    );

    expect(screen.getByText('mode: dark')).toBeInTheDocument();
  });
});
