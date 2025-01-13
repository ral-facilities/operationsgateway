import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import favouriteFiltersJson from '../mocks/favouriteFilters.json';
import { renderComponentWithProviders } from '../testUtils';
import DeleteFavouriteFilterDialogue, {
  DeleteFavouriteFilterDialogueProps,
} from './deleteFavouriteFilterDialogue.component';

describe('delete favourite filter dialogue', () => {
  let props: DeleteFavouriteFilterDialogueProps;
  let user: UserEvent;
  const onClose = vi.fn();

  const createView = (): RenderResult => {
    return renderComponentWithProviders(
      <DeleteFavouriteFilterDialogue {...props} />
    );
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      favouriteFilter: favouriteFiltersJson[0],
    };
    user = userEvent.setup();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });
  it('renders correctly', async () => {
    createView();
    expect(screen.getByText('Delete Favourite filter')).toBeInTheDocument();
    expect(
      screen.getByTestId('delete-favourite-filter-name')
    ).toHaveTextContent('test');
  });

  it('calls onClose when Close button is clicked', async () => {
    createView();
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays warning message when favourite filter data is not loaded', async () => {
    props = {
      ...props,
      favouriteFilter: undefined,
    };
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);
    const helperTexts = screen.getByText(
      'No data provided, Please refresh and try again'
    );
    expect(helperTexts).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('displays warning message when api errors', async () => {
    props = {
      ...props,
      favouriteFilter: favouriteFiltersJson[2],
    };
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);
    const helperTexts = screen.getByText('error');
    expect(helperTexts).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls handleDeleteFavouriteFilter when continue button is clicked with a valid favourite filter name', async () => {
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
