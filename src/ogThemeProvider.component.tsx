import React from 'react';
import {
  ThemeProvider,
  StyledEngineProvider,
  Theme,
  createTheme,
} from '@mui/material/styles';
import { MicroFrontendId } from './app.types';
import { sendThemeOptions } from './state/scigateway.actions';

// Store the parent theme options when received.
// Otherwise, set to an empty theme.
let parentThemeOptions: Theme = createTheme();

// Handle theme options sent from the parent app.
document.addEventListener(MicroFrontendId, (e) => {
  const action = (e as CustomEvent).detail;
  if (sendThemeOptions.match(action)) {
    parentThemeOptions = action.payload.theme;
    // SG dark mode blue is too dark for us, so set a custom, lighter blue
    if (parentThemeOptions.palette.mode === 'dark') {
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
          {this.props.children}
        </ThemeProvider>
      </StyledEngineProvider>
    );
  }
}

export default OGThemeProvider;
