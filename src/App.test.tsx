import { act } from '@testing-library/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App, { queryClient } from './App';
import { MicroFrontendId } from './app.types';
import { broadcastSignOut } from './state/scigateway.actions';
import { flushPromises } from './testUtils';

vi.mock('loglevel');

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('renders without crashing', async () => {
    const clearQueryCacheSpy = vi.spyOn(queryClient, 'clear');
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

    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, { detail: broadcastSignOut() })
    );

    expect(clearQueryCacheSpy).toHaveBeenCalled();
  });
});
