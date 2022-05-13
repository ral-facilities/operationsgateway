import React from "react";
import logo from "./logo.svg";
import "./App.css";
import * as log from "loglevel";
import { pluginName } from ".";

class App extends React.Component<unknown, { hasError: boolean }> {
  public constructor(props: unknown) {
    super(props);
    this.state = { hasError: false };
  }

  public componentDidCatch(error: Error | null): void {
    this.setState({ hasError: true });
    log.error(`${pluginName} failed with error: ${error}`);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error">
          {/* <React.Suspense
            fallback={<Preloader loading={true}>Finished loading</Preloader>}
          >
            <div
              style={{
                padding: 20,
                background: 'red',
                color: 'white',
                margin: 5,
              }}
            >
              <Translation>{(t) => t('app.error')}</Translation>
            </div>
          </React.Suspense> */}
          <p>Error</p>
        </div>
      );
    }

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
