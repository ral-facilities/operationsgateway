import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { RootState } from '../state/store';
import { renderComponentWithProviders, waitForRequest } from '../testUtils';
import FavouriteFiltersDialogue from './favouriteFiltersDialogue.component';

describe('Favorite filter dialogue component', () => {
  let props: React.ComponentProps<typeof FavouriteFiltersDialogue>;
  let user;

  const createView = (
    initialState?: Partial<RootState>,
    queryClient?: QueryClient
  ) => {
    return renderComponentWithProviders(
      <FavouriteFiltersDialogue {...props} />,
      {
        preloadedState: initialState,
        queryClient,
      }
    );
  };

  beforeEach(() => {
    user = userEvent.setup();
    props = {
      open: true,
      onClose: vi.fn(),
      channels: [
        { type: 'channel', value: 'type', label: 'type' },
        { type: 'channel', value: 'shotnum', label: 'Shot Number' },
      ],
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('calls onClose when close button is clicked', async () => {
    createView();

    await user.click(screen.getByText('Close'));

    expect(props.onClose).toHaveBeenCalled();
  });

  it('add a new favourite filter', async () => {
    const pendingRequest = waitForRequest('POST', '/users/filters');
    const params = new URLSearchParams();
    createView();

    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'test');

    const filter = screen.getByRole('combobox', { name: 'Filter' });

    await user.type(filter, 'sh{enter}={enter}1{enter}', {
      delay: null,
    });

    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    const request = await pendingRequest;
    params.set('name', 'test');
    params.set(
      'filter',
      '[{"type":"channel","value":"shotnum","label":"Shot Number"},{"type":"compop","value":"=","label":"="},{"type":"number","value":"1","label":"1"}]'
    );
    expect(new URL(request.url).searchParams).toEqual(params);
  });

  it('renders the save as disabled if name field is empty', async () => {
    createView();

    const filter = screen.getByRole('combobox', { name: 'Filter' });

    await user.type(filter, 'sh{enter}={enter}1{enter}', {
      delay: null,
    });

    expect(await screen.findByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('renders the save as disabled if filter field is empty', async () => {
    createView();

    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'test');
    expect(await screen.findByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('renders the save as disabled if filter field invalid', async () => {
    createView();

    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'test');

    const filter = screen.getByRole('combobox', { name: 'Filter' });

    await user.type(filter, 'sh{enter}={enter}', {
      delay: null,
    });
    await user.tab();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });
  });
});
