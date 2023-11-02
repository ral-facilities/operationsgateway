import React from 'react';
import { act } from '@testing-library/react';
import App from './App';
import { createRoot } from 'react-dom/client';
import { flushPromises } from './setupTests';

jest.mock('loglevel');

describe('App', () => {
  it('renders without crashing', async () => {
    const el = document.createElement('div');
    const root = createRoot(el);

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      await flushPromises();
    });
  });
});
