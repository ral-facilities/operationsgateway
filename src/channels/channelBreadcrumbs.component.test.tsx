import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChannelBreadcrumbs from './channelBreadcrumbs.component';

describe('Channel Breadcrumbs', () => {
  let currNode = '';
  const setCurrNode = vi.fn();
  const createView = () => {
    return render(
      <ChannelBreadcrumbs currNode={currNode} setCurrNode={setCurrNode} />
    );
  };

  it('should render correctly for path', () => {
    currNode = '/test/path';
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly for root', () => {
    currNode = '/';
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should call setCurrNode when link breadcrumb is clicked', async () => {
    const user = userEvent.setup();
    currNode = '/test/path';
    createView();

    await user.click(screen.getByRole('link', { name: 'test' }));
    expect(setCurrNode).toHaveBeenCalledWith('/test');
  });
});
