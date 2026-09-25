import createCache from '@emotion/cache';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import type Plotly from 'plotly.js';
import React from 'react';
import ReactDOM from 'react-dom';
import { PlotConfig } from '../state/slices/plotSlice';

// base code from https://medium.com/hackernoon/using-a-react-16-portal-to-do-something-cool-2a2d627b0202
// and https://github.com/facebook/react/issues/12355#issuecomment-410996235

interface WindowPortalWindow extends Window {
  Plotly?: typeof Plotly;
  getPlotConfig?: () => PlotConfig;
}

interface WindowPortalState {
  window: WindowPortalWindow | null;
  containerEl: HTMLDivElement | null;
  styleCache: EmotionCache | null;
}

export interface WindowPortalProps {
  title?: string;
  onClose: () => void;
  onBeforeClose?: (e: BeforeUnloadEvent) => void;
  children: React.ReactNode;
  innerWidth: number;
  innerHeight: number;
  screenX: number;
  screenY: number;
}

export default class WindowPortal extends React.PureComponent<
  WindowPortalProps,
  WindowPortalState
> {
  constructor(props: WindowPortalProps) {
    super(props);
    this.state = { window: null, styleCache: null, containerEl: null };
  }

  public getWindow(): WindowPortalWindow | null {
    return this.state.window;
  }

  componentDidMount() {
    // open a new browser window and store a reference to it
    const externalWindow = window.open(
      '',
      '',
      `innerWidth=${this.props.innerWidth},innerHeight=${this.props.innerHeight},left=${this.props.screenX < 0 ? this.props.screenX - this.props.innerWidth : this.props.screenX},top=${this.props.screenY < 0 ? this.props.screenY - this.props.innerHeight : this.props.screenY}`
    );
    // create a container div
    const el = document.createElement('div');
    const cache = createCache({ key: 'external', container: el });

    if (externalWindow) {
      externalWindow.document.title = `OperationsGateway Plot - ${this.props.title}`;

      // append the container <div> (that will have props.children appended to it via React Portal) to the body of the new window
      externalWindow.document.body.appendChild(el);

      // append plotly.js libraries to head
      // we do this so that all the Plotly.js code which relies on window references the correct window (i.e. the popup)
      const plotlyjsScript = document.createElement('script');
      plotlyjsScript.src =
        'https://cdnjs.cloudflare.com/ajax/libs/plotly.js/3.1.1/plotly.min.js'; // need the main bundle to include scattergl for traces optimisation and bars charts for vectors
      plotlyjsScript.crossOrigin = 'anonymous';
      plotlyjsScript.referrerPolicy = 'no-referrer';
      plotlyjsScript.async = false;
      plotlyjsScript.defer = false;
      externalWindow.document.head.appendChild(plotlyjsScript);

      const plotlyjsCode = document.createElement('script');
      plotlyjsCode.type = 'text/javascript';

      /**
       * This code in the below string (which gets inserted into the script tag)
       * does the following:
       * `waitForElm` - given a selector, returns a promise that resolves with the elements
       * using a `MutationObserver` to inspect DOM changes - used to wait for Plotly.js div element(s) to be loaded by React
       * `waitForPlotlyJs` - is a simple `setInterval` that checks if the Plotly object has loaded before running any Plotly.js code
       * `MutationObserver` code - we need a way to pass the `data` and `options` variables from
       * React in the main window to the Plotly.js code. We do this by using data-* attributes on the canvas element,
       * which React can set (see plot.component.tsx). The MutationObserver thus watches for changes to the chart element,
       * which then updates Plotly.js if necessary
       * `onResize` - resizes the image window overlay canvas (which we draw crosshairs and zoom squares on) properly
       */
      const code = `
      // can't just set canvas size via CSS as that causes scaling issues, so use resize observer
      // to observe when the CSS/display size changes and sync it to the canvas height & width properties
      // also need to account for dpi to ensure things are drawn at correct scale
      // from: https://webgl2fundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
      // needs to be done in the popup window as browsers throttle resize observer when the window it's running in isn't in focus
      const onResize = (entries) => {
        for (const entry of entries) {
          let width;
          let height;
          let dpr =
            entry.target.ownerDocument.defaultView?.devicePixelRatio ?? 1;
          if (entry.devicePixelContentBoxSize) {
            // NOTE: Only this path gives the correct answer
            // The other paths are imperfect fallbacks
            // for browsers that don't provide anyway to do this
            width = entry.devicePixelContentBoxSize[0].inlineSize;
            height = entry.devicePixelContentBoxSize[0].blockSize;
            dpr = 1; // it's already in width and height
          } else if (entry.contentBoxSize) {
            if (entry.contentBoxSize[0]) {
              width = entry.contentBoxSize[0].inlineSize;
              height = entry.contentBoxSize[0].blockSize;
            } else {
              // @ts-expect-error we expect an error here as this code is covering old browsers where the type was different
              width = entry.contentBoxSize.inlineSize;
              // @ts-expect-error we expect an error here as this code is covering old browsers where the type was different
              height = entry.contentBoxSize.blockSize;
            }
          } else {
            width = entry.contentRect.width;
            height = entry.contentRect.height;
          }
          const displayWidth = Math.round(width * dpr);
          const displayHeight = Math.round(height * dpr);

          entry.target.width = displayWidth;
          entry.target.height = displayHeight;

          const ctx = entry.target.getContext('2d');
          ctx?.setTransform(1, 0, 0, 1, 0, 0);
          ctx?.scale(
            entry.target.ownerDocument.defaultView?.devicePixelRatio ?? 1,
            entry.target.ownerDocument.defaultView?.devicePixelRatio ?? 1
          );
        }
      };


      waitForElm("#overlay").then((divs) => {
        for (const overlay of divs) {
          const resizeObserver = new ResizeObserver(onResize);
          resizeObserver.observe(overlay, { box: 'content-box' });
        }
      });

      function waitForElm(selector) {
        return new Promise(resolve => {
          if (document.querySelectorAll(selector).length !== 0) {
            return resolve(document.querySelectorAll(selector));
          }

          const observer = new MutationObserver(mutations => {
            if (document.querySelectorAll(selector).length !== 0) {
              resolve(document.querySelectorAll(selector));
              observer.disconnect();
            }
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        });
      }

      var waitForPlotlyJs = setInterval(function () {
        if (typeof Plotly !== 'undefined') {          
          waitForElm(".plotly-chart").then((divs) => {
            for (const div of divs) {
              if (div) {
                Plotly.newPlot(div, JSON.parse(div.dataset.data), JSON.parse(div.dataset.layout), JSON.parse(div.dataset.config)).then(() => {
                  // ensure plotly plot is correct size initially
                  window.dispatchEvent(new Event('resize'));
                });

                const observer = new MutationObserver(mutations => {
                  for(let mutation of mutations) {
                    if (mutation.type === 'attributes') {
                      // ensure plotly plot is correct size initially
                      if (window.document.body.scrollHeight > window.document.body.offsetHeight) {
                        window.dispatchEvent(new Event('resize'));
                      }

                      if(mutation.attributeName === "data-data" || mutation.attributeName === "data-layout" || mutation.attributeName === "data-config"){
                        Plotly.react(div, JSON.parse(div.dataset.data), JSON.parse(div.dataset.layout), JSON.parse(div.dataset.config));
                      }
                    }
                  }
                });

                observer.observe(div, {
                  attributes: true
                });
              }
            }   
          });
          clearInterval(waitForPlotlyJs);
        }
      }, 10);
      `;
      plotlyjsCode.text = code;
      externalWindow.document.head.appendChild(plotlyjsCode);

      // reset body margin
      const element = document.createElement('style');
      externalWindow.document.head.appendChild(element);

      const sheet = element.sheet;

      let styles = 'body {';
      styles += 'margin:0;';
      styles += '}';

      sheet?.insertRule(styles, 0);

      this.setState({
        window: externalWindow,
        styleCache: cache,
        containerEl: el,
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
      this.state.window.addEventListener('unload', this.props.onClose);
      if (this.props.onBeforeClose)
        this.state.window.addEventListener(
          'beforeunload',
          this.props.onBeforeClose
        );
    }
    if (prevProps.title !== this.props.title && this.state.window) {
      // eslint-disable-next-line react/no-direct-mutation-state
      this.state.window.document.title = `OperationsGateway Plot - ${this.props.title}`;
    }
    if (prevProps.onClose !== this.props.onClose) {
      this.state.window?.removeEventListener('unload', prevProps.onClose);
      this.state.window?.addEventListener('unload', this.props.onClose);
    }
    if (prevProps.onBeforeClose !== this.props.onBeforeClose) {
      if (prevProps.onBeforeClose)
        this.state.window?.removeEventListener(
          'beforeunload',
          prevProps.onBeforeClose
        );
      if (this.props.onBeforeClose)
        this.state.window?.addEventListener(
          'beforeunload',
          this.props.onBeforeClose
        );
    }
  }

  render() {
    const { containerEl, styleCache } = this.state;
    if (!containerEl || !styleCache) {
      return null;
    }
    // create the React portal only once containerEl has been appended to the new window
    return ReactDOM.createPortal(
      <CacheProvider value={styleCache}>
        <CssBaseline enableColorScheme />
        {this.props.children}
      </CacheProvider>,
      containerEl
    );
  }
}
