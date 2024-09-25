import { fireEvent, render, screen } from '@testing-library/react';
import { flushPromises } from '../testUtils';
import ImageView, { ImageViewProps } from './imageView.component';

describe('Image view component', () => {
  let props: ImageViewProps;

  beforeAll(() => {
    // mock to ensure img.onload gets called to set the canvas width & height
    // modified from: https://github.com/jsdom/jsdom/issues/1816#issuecomment-432496573
    Object.defineProperty(global.Image.prototype, 'src', {
      set() {
        setTimeout(() => this.onload());
      },
    });
    Object.defineProperty(global.Image.prototype, 'height', {
      get: () => 200,
    });
    Object.defineProperty(global.Image.prototype, 'width', {
      get: () => 300,
    });
  });

  beforeEach(() => {
    props = {
      image: 'testSrc',
      title: 'Test image',
      viewReset: false,
    };
  });

  it('renders an image and a canvas overlay', async () => {
    const { asFragment } = render(<ImageView {...props} />);

    // "load" image
    await flushPromises();

    expect(asFragment()).toMatchSnapshot();
  });

  it('can zoom into image', async () => {
    render(<ImageView {...props} />);

    // "load" image
    await flushPromises();

    const image = screen.getByAltText('Test image');

    fireEvent.mouseDown(image, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.mouseMove(image, { button: 0, clientX: 100, clientY: 100 });
    fireEvent.mouseUp(image, { button: 0, clientX: 100, clientY: 100 });

    expect(image).toHaveStyle({
      transform: 'translate(0px,0px) scale(2)',
    });
    fireEvent.mouseDown(image, { button: 0, clientX: 100, clientY: 100 });
    fireEvent.mouseMove(image, { button: 0, clientX: 40, clientY: 80 });
    fireEvent.mouseUp(image, { button: 0, clientX: 0, clientY: 0 });

    expect(image).toHaveStyle({
      transform: 'translate(-200px,-300px) scale(10)',
    });
  });

  it('can pan around zoomed image', async () => {
    render(<ImageView {...props} />);

    // "load" image
    await flushPromises();

    const image = screen.getByAltText('Test image');

    // zoom into image
    fireEvent.mouseDown(image, { button: 0, clientX: 150, clientY: 100 });
    fireEvent.mouseMove(image, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.mouseUp(image, { button: 0, clientX: 0, clientY: 0 });

    expect(image).toHaveStyle({
      transform: 'translate(0px,0px) scale(2)',
    });

    fireEvent.mouseDown(image, {
      shiftKey: true,
      button: 0,
      clientX: 100,
      clientY: 100,
    });
    fireEvent.mouseMove(image, {
      shiftKey: true,
      button: 0,
      clientX: 50,
      clientY: 50,
    });
    fireEvent.mouseUp(image, {
      shiftKey: true,
      button: 0,
      clientX: 50,
      clientY: 50,
    });

    expect(image).toHaveStyle({
      transform: 'translate(-50px,-50px) scale(2)',
    });
  });

  it('resets view when viewReset is changed', async () => {
    const { rerender } = render(<ImageView {...props} />);

    // "load" image
    await flushPromises();

    const image = screen.getByAltText('Test image');

    fireEvent.mouseDown(image, { button: 0, clientX: 100, clientY: 100 });
    fireEvent.mouseMove(image, { button: 0, clientX: 50, clientY: 100 });
    fireEvent.mouseUp(image, { button: 0, clientX: 50, clientY: 100 });

    expect(image).toHaveStyle({
      transform: 'translate(-300px,-600px) scale(6)',
    });

    props.viewReset = !props.viewReset;
    rerender(<ImageView {...props} />);

    expect(image).toHaveStyle({
      transform: 'translate(0px,0px) scale(1)',
    });
  });

  it('ignores non-left mouse clicks and mouse move events without corresponding mouse down events', async () => {
    render(<ImageView {...props} />);

    // "load" image
    await flushPromises();

    const image = screen.getByAltText('Test image');

    fireEvent.mouseDown(image, { button: 2, clientX: 50, clientY: 100 });

    expect(image).toHaveStyle({
      transform: 'translate(0px,0px) scale(1)',
    });

    fireEvent.mouseMove(image, { button: 0, clientX: 50, clientY: 100 });

    expect(image).toHaveStyle({
      transform: 'translate(0px,0px) scale(1)',
    });
  });

  it("doesn't let you pan out of bounds", async () => {
    render(<ImageView {...props} />);

    // "load" image
    await flushPromises();

    const image = screen.getByAltText('Test image');

    fireEvent.mouseDown(image, { button: 0, clientX: 75, clientY: 50 });
    fireEvent.mouseMove(image, { button: 0, clientX: 225, clientY: 150 });
    fireEvent.mouseUp(image, { button: 0, clientX: 225, clientY: 150 });

    expect(image).toHaveStyle({
      transform: 'translate(-150px,-100px) scale(2)',
    });

    // try to pan out of bounds past 300,200
    fireEvent.mouseDown(image, {
      shiftKey: true,
      button: 0,
      clientX: 200,
      clientY: 200,
    });
    fireEvent.mouseMove(image, {
      shiftKey: true,
      button: 0,
      clientX: 0,
      clientY: 0,
    });
    fireEvent.mouseUp(image, {
      shiftKey: true,
      button: 0,
      clientX: 0,
      clientY: 0,
    });

    expect(image).toHaveStyle({
      transform: 'translate(-150px,-100px) scale(2)',
    });

    // try to pan out of bounds past 0,0
    fireEvent.mouseDown(image, {
      shiftKey: true,
      button: 0,
      clientX: 0,
      clientY: 0,
    });
    fireEvent.mouseMove(image, {
      shiftKey: true,
      button: 0,
      clientX: 200,
      clientY: 200,
    });
    fireEvent.mouseUp(image, {
      shiftKey: true,
      button: 0,
      clientX: 200,
      clientY: 200,
    });

    expect(image).toHaveStyle({
      transform: 'translate(0px,0px) scale(2)',
    });
  });

  it("doesn't let you zoom out of bounds", async () => {
    const { rerender } = render(<ImageView {...props} />);

    // "load" image
    await flushPromises();

    const image = screen.getByAltText('Test image');

    // try to zoom out of bounds past 300,200 on x axis
    fireEvent.mouseDown(image, { button: 0, clientX: 285, clientY: 184 });
    fireEvent.mouseMove(image, { button: 0, clientX: 285, clientY: 200 });
    fireEvent.mouseUp(image, { button: 0, clientX: 285, clientY: 200 });

    expect(image).toHaveStyle({
      transform: 'translate(-3450px,-2300px) scale(12.5)',
    });

    props.viewReset = !props.viewReset;
    rerender(<ImageView {...props} />);

    // try to zoom out of bounds past 300,200 on y axis
    fireEvent.mouseDown(image, { button: 0, clientX: 285, clientY: 195 });
    fireEvent.mouseMove(image, { button: 0, clientX: 300, clientY: 195 });
    fireEvent.mouseUp(image, { button: 0, clientX: 300, clientY: 195 });

    expect(image).toHaveStyle({
      transform: 'translate(-5700px,-3800px) scale(20)',
    });

    props.viewReset = !props.viewReset;
    rerender(<ImageView {...props} />);

    // try to zoom out of bounds past 0 on x axis
    fireEvent.mouseDown(image, { button: 0, clientX: 15, clientY: 16 });
    fireEvent.mouseMove(image, { button: 0, clientX: 14, clientY: 0 });
    fireEvent.mouseUp(image, { button: 0, clientX: 14, clientY: 0 });

    expect(image).toHaveStyle({
      transform: 'translate(0px,0px) scale(12.5)',
    });

    props.viewReset = !props.viewReset;
    rerender(<ImageView {...props} />);

    // try to zoom out of bounds past 0 on Y axis
    fireEvent.mouseDown(image, { button: 0, clientX: 15, clientY: 5 });
    fireEvent.mouseMove(image, { button: 0, clientX: 0, clientY: 4 });
    fireEvent.mouseUp(image, { button: 0, clientX: 0, clientY: 4 });

    expect(image).toHaveStyle({
      transform: 'translate(0px,0px) scale(20)',
    });
  });

  it("doesn't let you zoom if zoom box is too small or zoom box too far out of bounds", async () => {
    render(<ImageView {...props} />);

    // "load" image
    await flushPromises();

    const image = screen.getByAltText('Test image');

    // try a zoom box which is too small
    fireEvent.mouseDown(image, { button: 0, clientX: 100, clientY: 100 });
    fireEvent.mouseMove(image, { button: 0, clientX: 101, clientY: 101 });
    fireEvent.mouseUp(image, { button: 0, clientX: 101, clientY: 101 });

    expect(image).toHaveStyle({
      transform: 'translate(0px,0px) scale(1)',
    });

    // try a zoom box which exceeds 300,200
    fireEvent.mouseDown(image, { button: 0, clientX: 290, clientY: 100 });
    fireEvent.mouseMove(image, { button: 0, clientX: 291, clientY: 150 });
    fireEvent.mouseUp(image, { button: 0, clientX: 291, clientY: 150 });

    fireEvent.mouseDown(image, { button: 0, clientX: 150, clientY: 190 });
    fireEvent.mouseMove(image, { button: 0, clientX: 250, clientY: 191 });
    fireEvent.mouseUp(image, { button: 0, clientX: 250, clientY: 191 });

    expect(image).toHaveStyle({
      transform: 'translate(0px,0px) scale(1)',
    });

    // try a zoom box which exceeds 0,0
    fireEvent.mouseDown(image, { button: 0, clientX: 1, clientY: 150 });
    fireEvent.mouseMove(image, { button: 0, clientX: 0, clientY: 100 });
    fireEvent.mouseUp(image, { button: 0, clientX: 0, clientY: 100 });

    fireEvent.mouseDown(image, { button: 0, clientX: 250, clientY: 1 });
    fireEvent.mouseMove(image, { button: 0, clientX: 150, clientY: 0 });
    fireEvent.mouseUp(image, { button: 0, clientX: 150, clientY: 0 });

    expect(image).toHaveStyle({
      transform: 'translate(0px,0px) scale(1)',
    });
  });
});
