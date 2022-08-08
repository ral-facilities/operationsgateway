import React from 'react';
import ReactDOM from 'react-dom';

// base code from https://medium.com/hackernoon/using-a-react-16-portal-to-do-something-cool-2a2d627b0202
// and https://github.com/facebook/react/issues/12355#issuecomment-410996235

function copyStyles(sourceDoc: Document, targetDoc: Document): void {
  Array.from(sourceDoc.styleSheets).forEach((styleSheet) => {
    if (styleSheet.ownerNode) {
      const nodeCopy = targetDoc.importNode(styleSheet.ownerNode, true);
      targetDoc.head.appendChild(nodeCopy);
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
  private observer: MutationObserver | undefined;

  constructor(props: WindowPortalProps) {
    super(props);

    this.state = { window: null, containerEl: null };
    this.handleResize = this.handleResize.bind(this);
    this.mutatationObserverCallback =
      this.mutatationObserverCallback.bind(this);
  }

  handleResize() {
    this.state.window?.clearTimeout(windowResizeTimeout);
    windowResizeTimeout = this.state.window?.setTimeout(() => {
      window.dispatchEvent(
        new Event(`resize ${this.state.window?.document.title}`)
      );
    }, 100);
  }

  // Callback function to execute when mutations are observed
  mutatationObserverCallback(
    mutationsList: MutationRecord[],
    observer: MutationObserver
  ) {
    for (let mutation of mutationsList) {
      if (
        this.state.window &&
        mutation.addedNodes.length &&
        mutation.addedNodes[0].nodeType === Node.ELEMENT_NODE &&
        (mutation.addedNodes[0] as Element).tagName.toLowerCase() === 'style'
      ) {
        const nodeCopy = this.state.window.document.importNode(
          mutation.addedNodes[0],
          true
        );
        this.state.window.document.head.appendChild(nodeCopy);
      }
    }
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
    }
  }

  componentWillUnmount() {
    this.observer?.disconnect();
    this.state.window?.removeEventListener('resize', this.handleResize);

    // tidy up by closing the window if we unmount
    this.state.window?.close();
  }

  componentDidUpdate(
    prevProps: WindowPortalProps,
    prevState: WindowPortalState
  ) {
    if (prevState.window === null && this.state.window) {
      // chart js doesn't resize properly without this as it is listening to the original window's resize events
      this.state.window.addEventListener('resize', this.handleResize);

      // copy over our CSS styling
      copyStyles(document, this.state.window.document);

      // code below watches main window's styles so that conditional styles work correctly

      // Select the node that will be observed for mutations
      const targetNode = window.document.getElementsByTagName('head')[0];

      // Options for the observer (which mutations to observe)
      // Set childList to true as we want to observe if style tag has been added as a child of the head element.)
      const config = { attributes: false, childList: true, subtree: false };

      // Create an observer instance linked to the callback function
      this.observer = new MutationObserver(this.mutatationObserverCallback);

      // Start observing the target node for configured mutations
      this.observer.observe(targetNode, config);
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
