import { render } from '@testing-library/react';
import { ImagePlotProps, XImagePlot, YImagePlot } from './imagePlot.component';
import imageCrosshairJson from '../mocks/imageCrosshair.json';

describe('Image plot component', () => {
  let props: ImagePlotProps;

  beforeEach(() => {
    props = {
      imageDims: { width: 100, height: 100 },
      data: imageCrosshairJson.column.intensity,
      crosshairPosition: 1,
    };
  });

  it('renders a canvas element with the correct attributes passed the correct props for an X axis plot', () => {
    // emulate loading first with no image dimensions loaded and then the image dimensions loaded
    const { rerender, asFragment } = render(
      <XImagePlot {...props} imageDims={{ width: 0, height: 0 }} />
    );

    rerender(<XImagePlot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders a canvas element with the correct attributes passed the correct props for a Y axis plot', () => {
    // emulate loading first with no image dimensions loaded and then the image dimensions loaded
    const { rerender, asFragment } = render(
      <YImagePlot {...props} imageDims={{ width: 0, height: 0 }} />
    );

    rerender(<YImagePlot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders a canvas element with no annotation if crosshairPosition is undefined', () => {
    const { asFragment } = render(
      <YImagePlot {...props} crosshairPosition={undefined} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
