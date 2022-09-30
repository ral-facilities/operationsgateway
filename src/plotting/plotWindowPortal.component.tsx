import React from 'react';
import ReactDOM from 'react-dom';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createCache from '@emotion/cache';

// base code from https://medium.com/hackernoon/using-a-react-16-portal-to-do-something-cool-2a2d627b0202
// and https://github.com/facebook/react/issues/12355#issuecomment-410996235

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
  }

  componentDidMount() {
    // open a new browser window and store a reference to it
    const externalWindow = window.open(
      '',
      '',
      'width=600,height=400,left=200,top=200'
    );
    // create a container div
    const el = document.createElement('div');
    const cache = createCache({ key: 'external', container: el });

    if (externalWindow) {
      externalWindow.document.title = `OperationsGateway Plot - ${this.props.title}`;

      // append the container <div> (that will have props.children appended to it via React Portal) to the body of the new window
      externalWindow.document.body.appendChild(el);

      // append chart.js libraries to head
      // we do this so that all the Chart.js code which relies on window references the correct window (i.e. the popup)
      const chartjsScript = document.createElement('script');
      chartjsScript.src =
        'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.js';
      chartjsScript.crossOrigin = 'anonymous';
      chartjsScript.referrerPolicy = 'no-referrer';
      chartjsScript.async = false;
      chartjsScript.defer = false;
      externalWindow.document.head.appendChild(chartjsScript);

      const hammerjsScript = externalWindow.document.createElement('script');
      hammerjsScript.src =
        'https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js';
      hammerjsScript.crossOrigin = 'anonymous';
      hammerjsScript.referrerPolicy = 'no-referrer';
      hammerjsScript.async = false;
      hammerjsScript.defer = false;
      externalWindow.document.head.appendChild(hammerjsScript);

      const chartjsZoomScript = externalWindow.document.createElement('script');
      chartjsZoomScript.src =
        'https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-zoom/1.2.1/chartjs-plugin-zoom.js';
      chartjsZoomScript.crossOrigin = 'anonymous';
      chartjsZoomScript.referrerPolicy = 'no-referrer';
      chartjsZoomScript.async = false;
      chartjsZoomScript.defer = false;
      externalWindow.document.head.appendChild(chartjsZoomScript);

      const chartjsDateFnsScript = document.createElement('script');
      // TODO: switch this to cdnjs once it's added - this is for consistency and so we can use renovate to update it
      chartjsDateFnsScript.src =
        'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@2.0.0/dist/chartjs-adapter-date-fns.bundle.min.js';
      chartjsDateFnsScript.crossOrigin = 'anonymous';
      chartjsDateFnsScript.referrerPolicy = 'no-referrer';
      chartjsDateFnsScript.async = false;
      chartjsDateFnsScript.defer = false;
      externalWindow.document.head.appendChild(chartjsDateFnsScript);

      const chartjsCode = document.createElement('script');
      chartjsCode.type = 'text/javascript';

      /**
       * This code in the below string (which gets inserted into the script tag)
       * does the following:
       * `waitForElm` - given a selector, returns a promise that resolves with the element
       * using a `MutationObserver` to inspect DOM changes - used to wait for Chart.js canvas element to be loaded by React
       * `waitForChartJS` - is a simple `setInterval` that checks if the chart.js object has loaded before running any Chart.js code
       * `MutationObserver` code - we need a way to pass the `data` and `options` variables from
       * React in the main window to the Chart.js code. We do this by using data-* attributes on the canvas element,
       * which React can set (see plot.component.tsx). The MutationObserver thus watches for changes to the canvas object,
       * which then updates Chart.js if necessary
       * In the mutation observer code, when options are updated we set the legend filter function to filter out datasets
       * which have been set to transparent (which is done via the show/hide buttons)
       */
      const code = `
      function waitForElm(selector) {
        return new Promise(resolve => {
          if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
          }
  
          const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
              resolve(document.querySelector(selector));
              observer.disconnect();
            }
          });
  
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        });
      }

      var waitForChartJS = setInterval(function () {
        if (typeof Chart !== 'undefined' && typeof Hammer !== 'undefined' && typeof ChartZoom !== 'undefined' && Chart._adapters._date.prototype._id === 'date-fns') {
          waitForElm("#my-chart").then((canvas) => {
            if (canvas && canvas.getContext('2d')) {
              const chart = new Chart(canvas.getContext('2d'), {
                type: canvas.dataset.type,
                data: JSON.parse(canvas.dataset.data),
                options: JSON.parse(canvas.dataset.options),
              });
              window.chart = chart;

              const observer = new MutationObserver(mutations => {
                for(let mutation of mutations) {
                  if (mutation.type === 'attributes') {
                    if(mutation.attributeName === "data-options"){
                      const newOptions = JSON.parse(canvas.dataset.options);
                      chart.options = {
                        ...newOptions,
                        plugins: {
                          ...newOptions?.plugins,
                          legend: {
                            ...newOptions?.plugins?.legend,
                            labels: {
                              ...newOptions?.plugins?.legend?.labels,
                              filter: function filterLabels(item) {
                                if (item.fillStyle && item.fillStyle === "rgba(0,0,0,0)") return false;
                                else if (item.strokeStyle && item.strokeStyle === "rgba(0,0,0,0)") return false;
                                else return true;
                              },
                            },
                          },
                        },
                      };
                      chart.update("none");
                    }
                    else if(mutation.attributeName === "data-data"){
                      chart.data = JSON.parse(canvas.dataset.data);
                      chart.update("none");
                    }
                    else if(mutation.attributeName === "data-type"){
                      chart.config.type = canvas.dataset.type;
                      chart.update();
                    }
                    else if(mutation.attributeName === "data-view"){
                      chart.resetZoom("none");
                      chart.update("none");
                    }
                  }
                }
              });
      
              observer.observe(canvas, {
                attributes: true
              });
            }
          });
          clearInterval(waitForChartJS);
        }
      }, 10);
      `;
      chartjsCode.text = code;
      externalWindow.document.head.appendChild(chartjsCode);

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
    prevProps: PlotWindowPortalProps,
    prevState: PlotWindowPortalState
  ) {
    if (prevState.window === null && this.state.window) {
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
