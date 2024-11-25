import { render } from '@testing-library/react';
import { ImagePlotProps, XImagePlot, YImagePlot } from './imagePlot.component';
import imageCrosshairJson from '../mocks/imageCrosshair.json';

describe('Image plot component', () => {
  let props: ImagePlotProps;

  beforeEach(() => {
    props = {
      image:
        '/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMAAwICAwICAwMDAwQDAwQFCAUFBAQFCgcHBggMCgwMCwoLCw0OEhANDhEOCwsQFhARExQVFRUMDxcYFhQYEhQVFP/bAEMBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIABkAGQMBIgACEQEDEQH/xAAbAAABBAMAAAAAAAAAAAAAAAAFAAYICQECB//EACYQAAICAgICAQQDAQAAAAAAAAECAwQFBhESABMHISIxQRQVFkL/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8ArB1DXTt+24bBLfpYpsnchpi9kpvTWr+xwvslf/lF55J/QB8fGX+GasFvP2MbscN3XtetNUy+SlgCPXYSMkZSNXYTLKVIjKN9SD39a/cR2iYbGZHDM9ajjc3szW2iGOy981Ilg6p0eIB4vbIzl16+wkAD7G7crYLgdP0nIfEuxZLNQXa23x2n9mLpasktC4/EX9lJJIa7FllYS9GEqnotbpzLyGCtXb8BFrWbNOvae7XetWtxTyQiJ2SaCOZeyBmCkCQAgMRyD9fA3kg/mqvrNbHbjHl9bxeK2d7dSXXr2Nyzu7UQAEhlpB5BFzXeJgz+vj1qqqeWIj54BrSs3DrO54HMWI3lr4/IV7ciRcdmWORWIHP054H78f2U+QdO1nHf5vUKuYyeq5anWfYTm/VXuWraDk+hoy6xRxP2aPkMSWIk7gADlR/J8x4B/dM1Qy9rHR47+TJWo0o6gs3EVJp+pYhmVWYDqGCAdj9sa/j8BvebeLwP/9k=',
      data: imageCrosshairJson.column.intensity,
      crosshairPosition: 1,
    };

    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {
      get: () => 100,
    });
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {
      get: () => 100,
    });
  });

  it('renders a canvas element with the correct attributes passed the correct props for an X axis plot', () => {
    // emulate loading first with no image from the query and then the image loading
    const { rerender, asFragment } = render(
      <XImagePlot {...props} image={undefined} />
    );

    rerender(<XImagePlot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders a canvas element with the correct attributes passed the correct props for a Y axis plot', () => {
    // emulate loading first with no image from the query and then the image loading
    const { rerender, asFragment } = render(
      <YImagePlot {...props} image={undefined} />
    );

    rerender(<YImagePlot {...props} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
