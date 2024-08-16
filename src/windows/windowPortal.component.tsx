import createCache from '@emotion/cache';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { CssBaseline, Theme, useTheme } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom';

// base code from https://medium.com/hackernoon/using-a-react-16-portal-to-do-something-cool-2a2d627b0202
// and https://github.com/facebook/react/issues/12355#issuecomment-410996235

interface WindowPortalState {
  window: Window | null;
  containerEl: HTMLDivElement | null;
  styleCache: EmotionCache | null;
}

export interface WindowPortalProps {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  innerWidth: number;
  innerHeight: number;
  screenX: number;
  screenY: number;
}

export class WindowPortal extends React.PureComponent<
  WindowPortalProps & { theme: Theme },
  WindowPortalState
> {
  constructor(props: WindowPortalProps & { theme: Theme }) {
    super(props);
    this.state = { window: null, styleCache: null, containerEl: null };
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

      // append chart.js libraries to head
      // we do this so that all the Chart.js code which relies on window references the correct window (i.e. the popup)
      const chartjsScript = document.createElement('script');
      chartjsScript.src =
        'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
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
        'https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-zoom/2.0.0/chartjs-plugin-zoom.js';
      chartjsZoomScript.crossOrigin = 'anonymous';
      chartjsZoomScript.referrerPolicy = 'no-referrer';
      chartjsZoomScript.async = false;
      chartjsZoomScript.defer = false;
      externalWindow.document.head.appendChild(chartjsZoomScript);

      const chartjsDateFnsScript = document.createElement('script');
      // TODO: switch this to cdnjs once it's added - this is for consistency and so we can use renovate to update it
      chartjsDateFnsScript.src =
        'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js';
      chartjsDateFnsScript.crossOrigin = 'anonymous';
      chartjsDateFnsScript.referrerPolicy = 'no-referrer';
      chartjsDateFnsScript.async = false;
      chartjsDateFnsScript.defer = false;
      externalWindow.document.head.appendChild(chartjsDateFnsScript);

      const chartjsCode = document.createElement('script');
      chartjsCode.type = 'text/javascript';

      // need a theme element to attach theme info to which is observed for changes in the chart js code
      const themeElement = document.createElement('div');
      themeElement.id = 'themeElement';
      themeElement.dataset.mode = this.props.theme.palette.mode;
      externalWindow.document.body.appendChild(themeElement);

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
       * `addLegendAndTooltipFilters` - given a Chart.js options object, this returns the object with the legend and tooltip filter functions filled
       * which filter out datasets that have been set to transparent (which is done via the show/hide buttons)
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

      function addLegendAndTooltipFilters(options) {
        return {
          ...options,
          plugins: {
            ...options?.plugins,
            legend: {
              ...options?.plugins?.legend,
              labels: {
                ...options?.plugins?.legend?.labels,
                filter: function filterLabels(item) {
                  if (item.fillStyle && item.fillStyle === "rgba(0,0,0,0)") return false;
                  else if (item.strokeStyle && item.strokeStyle === "rgba(0,0,0,0)") return false;
                  else return true;
                },
              },
              onClick: (evt, legendItem, legend) => {
                const index = legendItem.datasetIndex;
                Chart.defaults.plugins.legend.onClick(evt, legendItem, legend);

                const ci = legend.chart;
      
                // only show relevant y axis if at least 1 dataset is visible on it 
                const scale = ci.getDatasetMeta(index).yAxisID;
                const datasetsVisibleOnAxis = ci.getSortedVisibleDatasetMetas().some((dataset) => dataset.yAxisID === scale);
                
                ci.options.scales[scale].display = datasetsVisibleOnAxis;
                ci.update("none");
              },
            },
            tooltip: {
              ...options?.plugins?.tooltip,
              filter: function filterTooltips(item) {
                if (item.dataset.borderColor && item.dataset.borderColor === "rgba(0,0,0,0)") return false;
                else if (item.dataset.backgroundColor && item.dataset.backgroundColor === "rgba(0,0,0,0)") return false;
                else return true;
              },
            },
          },
        };
      }

      var waitForChartJS = setInterval(function () {
        if (typeof Chart !== 'undefined' && typeof Hammer !== 'undefined' && typeof ChartZoom !== 'undefined' && Chart._adapters._date.prototype._id === 'date-fns') { 
          const lightModeColor = Chart.defaults.color;
          const lightModeBorderColor = Chart.defaults.borderColor;

          const themeElement = document.getElementById("themeElement");

          if (themeElement.dataset.mode === 'dark') {
            Chart.defaults.color = "#ADBABD";
            Chart.defaults.borderColor = "rgba(255,255,255,0.1)";
          }

          const themeObserver = new MutationObserver(mutations => {
            for(let mutation of mutations) {
              if (mutation.type === 'attributes') {
                if(mutation.attributeName === "data-mode"){
                  const mode = themeElement.dataset.mode;
                  if (mode === 'dark') {
                    Chart.defaults.color = "#ADBABD";
                    Chart.defaults.borderColor = "rgba(255,255,255,0.1)";
                  } else {
                    Chart.defaults.color = lightModeColor;
                    Chart.defaults.borderColor = lightModeBorderColor;
                  }
        
                  Object.values(Chart.instances).forEach(instance => {
                    Object.keys(instance.options.scales).forEach((key) => {
                      instance.options.scales[key].ticks.color = Chart.defaults.color;
                      instance.options.scales[key].title.color = Chart.defaults.color;
                      instance.options.scales[key].grid.color = Chart.defaults.borderColor;
                    });
                    instance.update("none");
                  })
                }
              }
            }
          });

          themeObserver.observe(themeElement, {
            attributes: true
          });
          
          waitForElm("#my-chart").then((canvas) => {
            if (canvas && canvas.getContext('2d')) {
              const chart = new Chart(canvas.getContext('2d'), {
                type: canvas.dataset.type,
                data: JSON.parse(canvas.dataset.data),
                options: addLegendAndTooltipFilters(JSON.parse(canvas.dataset.options)),
              });
              window.chart = chart;

              const observer = new MutationObserver(mutations => {
                for(let mutation of mutations) {
                  if (mutation.type === 'attributes') {
                    if(mutation.attributeName === "data-options"){
                      chart.options = addLegendAndTooltipFilters(JSON.parse(canvas.dataset.options));
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
    prevProps: WindowPortalProps & { theme: Theme },
    prevState: WindowPortalState
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
    if (prevProps.theme !== this.props.theme && this.state.window) {
      const themeElement =
        this.state.window.document.getElementById('themeElement');
      if (themeElement)
        themeElement.dataset.mode = this.props.theme.palette.mode;
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

const WindowPortalWithTheme = React.memo(
  React.forwardRef<WindowPortal, WindowPortalProps>(
    (props: WindowPortalProps, ref) => {
      const theme = useTheme();

      return <WindowPortal {...props} theme={theme} ref={ref} />;
    }
  )
);

export default WindowPortalWithTheme;
