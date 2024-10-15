import {
  render,
  screen,
  within,
  type RenderResult,
} from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import MaxShots, { type MaxShotsProps } from './maxShots.component';

describe('maxShots search', () => {
  let props: MaxShotsProps;
  const changeMaxShots = vi.fn();
  const searchParamsUpdated = vi.fn();

  const createView = (): RenderResult => {
    return render(<MaxShots {...props} />);
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with a selected value', () => {
    props = {
      maxShots: 50,
      changeMaxShots,
      searchParamsUpdated,
    };

    const { asFragment } = createView();
    expect(asFragment()).toMatchSnapshot();
  });

  describe('calls changeMaxShots when user clicks on', () => {
    let user: UserEvent;
    const changeMaxShots = vi.fn();

    beforeEach(() => {
      user = userEvent.setup();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('50 shots', async () => {
      props = {
        maxShots: 100,
        changeMaxShots,
        searchParamsUpdated,
      };
      createView();

      const maxShotsRadioGroup = screen.getByRole('radiogroup', {
        name: 'select max shots',
      });
      await user.click(
        within(maxShotsRadioGroup).getByLabelText('Select 50 max shots')
      );
      expect(changeMaxShots).toHaveBeenCalledWith(50);
      expect(searchParamsUpdated).toHaveBeenCalled();
    });

    it('1000 shots', async () => {
      props = {
        maxShots: 50,
        changeMaxShots,
        searchParamsUpdated,
      };
      createView();

      const maxShotsRadioGroup = screen.getByRole('radiogroup', {
        name: 'select max shots',
      });
      await user.click(
        within(maxShotsRadioGroup).getByLabelText('Select 1000 max shots')
      );
      expect(changeMaxShots).toHaveBeenCalledWith(1000);
      expect(searchParamsUpdated).toHaveBeenCalled();
    });

    it('unlimited', async () => {
      props = {
        maxShots: 50,
        changeMaxShots,
        searchParamsUpdated,
      };
      createView();

      const maxShotsRadioGroup = screen.getByRole('radiogroup', {
        name: 'select max shots',
      });
      await user.click(
        within(maxShotsRadioGroup).getByLabelText('Select unlimited max shots')
      );
      expect(changeMaxShots).toHaveBeenCalledWith(Infinity);
      expect(searchParamsUpdated).toHaveBeenCalled();
    });
  });
});
