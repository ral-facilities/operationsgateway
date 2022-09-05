import React from 'react';
import ReactDOM from 'react-dom';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createCache from '@emotion/cache';

// base code from https://medium.com/hackernoon/using-a-react-16-portal-to-do-something-cool-2a2d627b0202
// and https://github.com/facebook/react/issues/12355#issuecomment-410996235

let windowResizeTimeout: number | undefined;

interface PlotWindowPortalState {
  window: Window | null;
  containerEl: HTMLDivElement | null;
  styleCache: EmotionCache | null;
}

interface PlotWindowPortalProps {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

class PlotWindowPortal extends React.PureComponent<
  PlotWindowPortalProps,
  PlotWindowPortalState
> {
  constructor(props: PlotWindowPortalProps) {
    super(props);

    this.state = { window: null, styleCache: null, containerEl: null };
    this.handleResize = this.handleResize.bind(this);
  }

  handleResize() {
    this.state.window?.clearTimeout(windowResizeTimeout);
    windowResizeTimeout = this.state.window?.setTimeout(() => {
      window.dispatchEvent(
        new Event(`resize ${this.state.window?.document.title}`)
      );
    }, 100);
  }

  componentDidMount() {
    // open a new browser window and store a reference to it
    let externalWindow = window.open(
      '',
      '',
      'width=600,height=400,left=200,top=200'
    );
    // create a container div
    let el = document.createElement('div');
    const cache = createCache({ key: 'external', container: el });

    if (externalWindow) {
      externalWindow.document.title = `OperationsGateway Plot - ${this.props.title}`;

      // append the container <div> (that will have props.children appended to it via React Portal) to the body of the new window
      externalWindow.document.body.appendChild(el);

      this.setState({
        window: externalWindow,
        styleCache: cache,
        containerEl: el,
      });
    }
  }

  componentWillUnmount() {
    this.state.window?.removeEventListener('resize', this.handleResize);

    // tidy up by closing the window if we unmount
    this.state.window?.close();
  }

  componentDidUpdate(
    prevProps: PlotWindowPortalProps,
    prevState: PlotWindowPortalState
  ) {
    if (prevState.window === null && this.state.window) {
      // chart js doesn't resize properly without this as it is listening to the original window's resize events
      this.state.window.addEventListener('resize', this.handleResize);
      this.state.window.addEventListener('beforeunload', this.props.onClose);
    }
    if (prevProps.title !== this.props.title && this.state.window) {
      // eslint-disable-next-line react/no-direct-mutation-state
      this.state.window.document.title = `OperationsGateway Plot - ${this.props.title}`;
    }
    if (prevProps.onClose !== this.props.onClose) {
      this.state.window?.removeEventListener('beforeunload', prevProps.onClose);
      this.state.window?.addEventListener('beforeunload', this.props.onClose);
    }
  }

  render() {
    const { containerEl, styleCache } = this.state;
    if (!containerEl || !styleCache) {
      return null;
    }
    // create the React portal only once containerEl has been appended to the new window
    return ReactDOM.createPortal(
      <CacheProvider value={styleCache}>{this.props.children}</CacheProvider>,
      containerEl
    );
  }
}

export default PlotWindowPortal;
