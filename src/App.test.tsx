import { act } from '@testing-library/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { flushPromises } from './testUtils';

vi.mock('loglevel');

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
