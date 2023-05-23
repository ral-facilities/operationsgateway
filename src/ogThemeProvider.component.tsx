import React from 'react';
import {
  ThemeProvider,
  StyledEngineProvider,
  Theme,
  createTheme,
} from '@mui/material/styles';
import { MicroFrontendId } from './app.types';
import { sendThemeOptions } from './state/scigateway.actions';
import { CssBaseline } from '@mui/material';

declare module '@mui/material/styles' {
  interface Theme {
    colours?: { blue: string };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    colours?: { blue: string };
  }
}

// Store the parent theme options when received.
// Otherwise, set to an empty theme.
let parentThemeOptions: Theme = createTheme();

// Handle theme options sent from the parent app.
document.addEventListener(MicroFrontendId, (e) => {
  const action = (e as CustomEvent).detail;
  if (sendThemeOptions.match(action)) {
    parentThemeOptions = action.payload.theme;
    // SG dark mode blue is too dark for us, so set a custom, lighter blue
    if (
      parentThemeOptions.palette.mode === 'dark' &&
      parentThemeOptions.colours?.blue
    ) {
      parentThemeOptions.palette.primary.main = parentThemeOptions.colours.blue;
    }
  }
});

class OGThemeProvider extends React.Component<{ children: React.ReactNode }> {
  public constructor(props: { children: React.ReactNode }) {
    super(props);
  }

  public render(): React.ReactElement {
    return (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={parentThemeOptions}>
          {/* Technically CssBaseline isn't needed in plugins as it's in scigateway and it's global
              but it's useful to ensure consistency when developing a plugin independently */}
          <CssBaseline enableColorScheme />
          {this.props.children}
        </ThemeProvider>
      </StyledEngineProvider>
    );
  }
}

export default OGThemeProvider;
