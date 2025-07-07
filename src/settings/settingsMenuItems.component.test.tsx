import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  setMockedPreferredColourMap,
  setMockedVectorLimit,
  setMockedVectorSkip,
} from '../mocks/handlers';
import { RootState } from '../state/store';
import { renderComponentWithProviders } from '../testUtils';
import SettingsMenuItems from './settingsMenuItems.component';

describe('Settings Menu Items component', () => {
  let settings: HTMLDivElement;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    settings = document.createElement('div');
    settings.id = 'settings';
    const ul = document.createElement('ul');
    settings.appendChild(ul);

    document.body.appendChild(settings);

    user = userEvent.setup();

    // override to ensure we have the same starting colourmap
    setMockedPreferredColourMap('cividis');
  });

  afterEach(() => {
    vi.clearAllMocks();
    setMockedVectorLimit(undefined);
    setMockedVectorSkip(undefined);
  });

  const createView = (preloadedState?: Partial<RootState>) => {
    return renderComponentWithProviders(<SettingsMenuItems />, {
      preloadedState,
    });
  };

  describe('Preferred colour map', () => {
    it('renders dropdown only when menu is visible', async () => {
      document.body.removeChild(settings);
      const view = createView();

      expect(
        screen.queryByLabelText('Default Colour Map')
      ).not.toBeInTheDocument();

      act(() => {
        document.body.appendChild(settings);
      });

      await screen.findAllByLabelText('Default Colour Map');

      expect(view.baseElement).toMatchSnapshot();

      act(() => {
        document.body.removeChild(settings);
      });

      await waitFor(() =>
        expect(
          screen.queryByLabelText('Default Colour Map')
        ).not.toBeInTheDocument()
      );

      // check it works for the alternate selector as well
      settings.id = 'mobile-overflow-menu';

      act(() => {
        document.body.appendChild(settings);
      });

      await screen.findAllByLabelText('Default Colour Map');

      act(() => {
        document.body.removeChild(settings);
      });

      await waitFor(() =>
        expect(
          screen.queryByLabelText('Default Colour Map')
        ).not.toBeInTheDocument()
      );
    });

    it('lets user select a new default colourmap from the dropdown', async () => {
      const { queryClient } = createView();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const select = screen.getAllByRole('combobox', {
        name: 'Default Colour Map',
      })[0];
      await waitFor(() => expect(select).toHaveTextContent('cividis'));
      await user.click(select);

      const dropdown = screen.getAllByRole('listbox', {
        name: 'Default Colour Map',
        // This is used due to the nested focusTrap error caused by nested menuItems
        hidden: true,
      })[0];
      await user.click(
        within(dropdown).getByRole('option', {
          name: 'inferno',
          // This is used due to the nested focusTrap error caused by nested menuItems
          hidden: true,
        })
      );
      await waitFor(() => expect(select).toHaveTextContent('inferno'));

      expect(invalidateQueriesSpy).toHaveBeenCalled();
    });

    it('lets user reverse a colourmap', async () => {
      createView();
      await waitFor(() =>
        expect(
          screen.getAllByRole('combobox', { name: 'Default Colour Map' })[0]
        ).toHaveTextContent('cividis')
      );

      const reverseColourSwitch = screen.getAllByRole('checkbox', {
        name: 'Reverse Colour',
      })[0];

      expect(reverseColourSwitch).not.toBeChecked();
      expect(reverseColourSwitch).toBeEnabled();

      await user.click(reverseColourSwitch);

      expect(reverseColourSwitch).toBeEnabled();
      expect(reverseColourSwitch).toBeChecked();

      await user.click(reverseColourSwitch);

      expect(reverseColourSwitch).not.toBeChecked();
    });

    it('lets user see the extended colourmap list', async () => {
      createView();

      const extendedColourMapSwitch = screen.getByRole('checkbox', {
        name: 'Show extended colourmap options',
      });

      await user.click(extendedColourMapSwitch);

      expect(extendedColourMapSwitch).toBeChecked();

      const extendedSelect = screen.getAllByRole('combobox', {
        name: 'Default Colour Map',
      })[0];
      await user.click(extendedSelect);

      const extendedDropdown = screen.getByRole('listbox', {
        name: 'Default Colour Map',
        // This is used due to the nested focusTrap error caused by nested menuItems
        hidden: true,
      });

      await user.click(
        within(extendedDropdown).getByRole('option', {
          name: 'afmhot',
          // This is used due to the nested focusTrap error caused by nested menuItems
          hidden: true,
        })
      );

      await waitFor(() => expect(extendedSelect).toHaveTextContent('afmhot'));
      expect(
        screen.getAllByRole('checkbox', {
          name: 'Reverse Colour',
        })[0]
      ).toBeDisabled();
    });
  });

  describe('Vectors', () => {
    it('lets user set the vector upper bound', async () => {
      const { queryClient } = createView();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const vectorLimitInput = screen.getByLabelText('Upper Bound');

      await user.clear(vectorLimitInput);
      await user.type(vectorLimitInput, '1000');

      expect(vectorLimitInput).toHaveValue('1000');

      await waitFor(() => expect(invalidateQueriesSpy).toHaveBeenCalled());
    });

    it('lets user set the vector lower bound', async () => {
      const { queryClient } = createView();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const vectorSkipInput = screen.getByLabelText('Lower Bound');

      await user.clear(vectorSkipInput);
      await user.type(vectorSkipInput, '10');

      expect(vectorSkipInput).toHaveValue('10');
      await waitFor(() => expect(invalidateQueriesSpy).toHaveBeenCalled());
    });

    it('should display an error if vector upper bound is not a valid number', async () => {
      createView();
      const vectorLimitInput = screen.getByLabelText('Upper Bound');

      await user.clear(vectorLimitInput);
      await user.type(vectorLimitInput, 'abc');

      expect(
        await screen.findByText('Upper Bound must be a valid number')
      ).toBeInTheDocument();
    });

    it('should display an error if vector lower bound is not a valid number', async () => {
      createView();
      const vectorSkipInput = screen.getByLabelText('Lower Bound');

      await user.clear(vectorSkipInput);
      await user.type(vectorSkipInput, 'xyz');

      expect(
        await screen.findByText('Lower Bound must be a valid number')
      ).toBeInTheDocument();
    });

    it('should display an error if vector upper bound is less than vector lower bound', async () => {
      createView();
      const vectorLimitInput = screen.getByLabelText('Upper Bound');
      const vectorSkipInput = screen.getByLabelText('Lower Bound');

      await user.clear(vectorSkipInput);
      await user.type(vectorSkipInput, '20');

      await user.clear(vectorLimitInput);
      await user.type(vectorLimitInput, '10');

      expect(
        await screen.findByText(
          'Upper Bound must be greater than or equal to Lower Bound.'
        )
      ).toBeInTheDocument();
    });

    it('should display an error if vector upper bound is negative', async () => {
      createView();
      const vectorLimitInput = screen.getByLabelText('Upper Bound');

      await user.clear(vectorLimitInput);
      await user.type(vectorLimitInput, '-1');

      expect(
        await screen.findByText('Number must be greater than or equal to 0')
      ).toBeInTheDocument();
    });

    it('should display an error if vector lower bound is negative', async () => {
      createView();
      const vectorSkipInput = screen.getByLabelText('Lower Bound');

      await user.clear(vectorSkipInput);
      await user.type(vectorSkipInput, '-5');

      expect(
        await screen.findByText('Number must be greater than or equal to 0')
      ).toBeInTheDocument();
    });
  });
});
