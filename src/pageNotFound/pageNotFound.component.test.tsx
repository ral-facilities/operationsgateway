import { act } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { renderComponentWithProviders } from '../testUtils';
import PageNotFoundComponent from './pageNotFound.component';

describe('Page Not Found Component', () => {
  const createView = () => {
    const router = createBrowserRouter([
      { path: '*', Component: PageNotFoundComponent },
    ]);
    return renderComponentWithProviders(<RouterProvider router={router} />);
  };

  it('renders the basic 404 page', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });
});
