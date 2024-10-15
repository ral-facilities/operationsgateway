import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { RootState } from '../state/store';
import { getInitialState, renderComponentWithProviders } from '../testUtils';
import ThumbnailSelector from './thumbnailSelector.component';

describe('Thumbnail selector component', () => {
  const changeRecordId = vi.fn();
  let channelName: string;
  let recordId: string;

  beforeEach(() => {
    channelName = 'CHANNEL_BCDEF';
    recordId = '4';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createView = (preloadedState?: Partial<RootState>) => {
    return renderComponentWithProviders(
      <ThumbnailSelector
        channelName={channelName}
        recordId={recordId}
        changeRecordId={changeRecordId}
      />,
      { preloadedState }
    );
  };

  it('renders list of thumbnails and pagination controls', async () => {
    const view = createView();

    await screen.findAllByRole('img');

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly when loading', () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('can change results per page and current page', async () => {
    const user = userEvent.setup();

    createView();
    await screen.findAllByRole('img');

    expect(screen.getByText('1–18 of 18')).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Page size' }));
    await user.click(screen.getByRole('option', { name: '10' }));

    expect(screen.getByText('1–10 of 18')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Go to next page' }));

    expect(screen.getByText('11–18 of 18')).toBeInTheDocument();
  });

  it('clicking on a thumbnail calls changeRecordId', async () => {
    channelName = 'CHANNEL_CDEFG';
    recordId = '7';
    const user = userEvent.setup();

    createView();
    const thumbnails = await screen.findAllByRole('img');

    await user.click(thumbnails[0]);

    expect(changeRecordId).toHaveBeenCalledWith('7');
  });

  it('allows selection of 100 results when max shots is not 50', async () => {
    const user = userEvent.setup();

    createView({
      search: {
        searchParams: {
          ...getInitialState().search.searchParams,
          maxShots: 1000,
        },
      },
    });
    await screen.findAllByRole('img');

    await user.click(screen.getByRole('combobox', { name: 'Page size' }));
    expect(screen.getByRole('option', { name: '100' })).toBeInTheDocument();
  });

  it('displays max shots as the max pagination when record count is more than it', async () => {
    server.use(
      http.get('/records/count', () => HttpResponse.json(100, { status: 200 }))
    );

    createView();
    await screen.findAllByRole('img');

    expect(screen.getByText('1–25 of 50')).toBeInTheDocument();
  });
});
