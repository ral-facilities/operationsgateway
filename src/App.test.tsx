import React from 'react';
import { act } from '@testing-library/react';
import App from './App';
import { createRoot } from 'react-dom/client';
import { flushPromises } from './setupTests';
import { Provider } from 'react-redux';
import { store } from './state/store';

jest.mock('loglevel');

describe('App', () => {
  it('renders without crashing', async () => {
    const el = document.createElement('div');
    const root = createRoot(el);

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      root.render(
        <React.StrictMode>
          <Provider store={store}>
            <App />
          </Provider>
        </React.StrictMode>
      );
      await flushPromises();
    });
  });
});
