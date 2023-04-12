import React from 'react';
import { screen } from '@testing-library/react';
import ImageWindow from './imageWindow.component';
import userEvent from '@testing-library/user-event';
import { renderComponentWithProviders } from '../setupTests';
import { rest } from 'msw';
import { server } from '../mocks/server';
import { TraceOrImageWindow } from '../state/slices/windowSlice';
import { DEFAULT_WINDOW_VARS } from '../app.types';

jest.mock('../windows/windowPortal.component', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactMock = require('react');
  return ReactMock.forwardRef(({ children }, ref) => (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <mock-WindowPortal>{children}</mock-WindowPortal>
  ));
});

jest.mock('./imageView.component', () => () => (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <mock-ImageView data-testid="mock-image-view" />
));

describe('Image Window component', () => {
  let testImageConfig: TraceOrImageWindow;

  beforeEach(() => {
    testImageConfig = {
      open: true,
      type: 'image',
      channelName: 'TEST',
      recordId: '1',
      title: 'Test title',
      ...DEFAULT_WINDOW_VARS,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createView = () => {
    return renderComponentWithProviders(
      <ImageWindow onClose={jest.fn()} imageConfig={testImageConfig} />
    );
  };

  it('renders image window correctly', () => {
    createView();

    expect(screen.getByTestId('mock-image-view')).toBeVisible();
  });

  it('renders correctly while image is loading', () => {
    const loadingHandler = (req, res, ctx) => {
      // taken from https://github.com/mswjs/msw/issues/778 - a way of mocking pending promises without breaking jest
      return new Promise(() => undefined);
    };
    server.use(rest.get('/images', loadingHandler));

    createView();
    screen.getByLabelText('Image loading');
  });

  it('reset view button is visible and interactable', async () => {
    const user = userEvent.setup();
    createView();

    await user.click(screen.getByRole('button', { name: 'Reset View' }));
  });
});
