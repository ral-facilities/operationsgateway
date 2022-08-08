import React from 'react';
import ReactDOM from 'react-dom';

// base code from https://medium.com/hackernoon/using-a-react-16-portal-to-do-something-cool-2a2d627b0202
// and https://github.com/facebook/react/issues/12355#issuecomment-410996235

function copyStyles(sourceDoc: Document, targetDoc: Document): void {
  Array.from(sourceDoc.styleSheets).forEach((styleSheet) => {
    if (styleSheet.cssRules) {
      // for <style> elements
      const newStyleEl = sourceDoc.createElement('style');

      Array.from(styleSheet.cssRules).forEach((cssRule) => {
        // write the text of each rule into the body of the style element
        newStyleEl.appendChild(sourceDoc.createTextNode(cssRule.cssText));
      });

      targetDoc.head.appendChild(newStyleEl);
    } else if (styleSheet.href) {
      // for <link> elements loading CSS from a URL
      const newLinkEl = sourceDoc.createElement('link');

      newLinkEl.rel = 'stylesheet';
      newLinkEl.href = styleSheet.href;
      targetDoc.head.appendChild(newLinkEl);
    }
  });
}

let windowResizeTimeout: number | undefined;

interface WindowPortalState {
  window: Window | null;
  containerEl: HTMLDivElement | null;
}

interface WindowPortalProps {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

class WindowPortal extends React.PureComponent<
  WindowPortalProps,
  WindowPortalState
> {
  constructor(props: WindowPortalProps) {
    super(props);

    this.state = { window: null, containerEl: null };
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

    if (externalWindow) {
      externalWindow.document.title = `OperationsGateway Plot - ${this.props.title}`;

      // append the container <div> (that will have props.children appended to it via React Portal) to the body of the new window
      externalWindow.document.body.appendChild(el);

      this.setState({ window: externalWindow, containerEl: el });

      // chart js doesn't resize properly without this as it is listening to the original window's resize events
      externalWindow.addEventListener('resize', () => {
        externalWindow?.clearTimeout(windowResizeTimeout);
        windowResizeTimeout = externalWindow?.setTimeout(() => {
          console.log(`resizing ${externalWindow?.document.title}`);
          window.dispatchEvent(
            new Event(`resize ${externalWindow?.document.title}`)
          );
        }, 100);
      });
    }
  }

  componentWillUnmount() {
    // tidy up by closing the window if we unmount
    this.state.window?.close();
  }

  componentDidUpdate(
    prevProps: WindowPortalProps,
    prevState: WindowPortalState
  ) {
    if (prevState.window === null && this.state.window) {
      // copy over our CSS styling
      copyStyles(document, this.state.window.document);
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
    const { containerEl } = this.state;
    if (!containerEl) {
      return null;
    }
    // create the React portal only once containerEl has been appended to the new window
    return ReactDOM.createPortal(this.props.children, containerEl);
  }
}

export default WindowPortal;
