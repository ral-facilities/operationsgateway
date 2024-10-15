import { render } from '@testing-library/react';
import Preloader from './preloader.component';

describe('Preloader component', () => {
  const createView = (loading: boolean) => {
    return render(
      <Preloader loading={loading}>
        <div>Test</div>
      </Preloader>
    );
  };

  it('renders when the site is loading', () => {
    const view = createView(true);
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('does not render when the site is not loading', () => {
    const view = createView(false);
    expect(view.asFragment()).toMatchSnapshot();
  });
});
