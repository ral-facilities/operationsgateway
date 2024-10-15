import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setMockedPreferredColourMap } from './mocks/handlers';
import SettingsMenuItems from './settingsMenuItems.component';
import { RootState } from './state/store';
import { renderComponentWithProviders } from './testUtils';

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
  });

  const createView = (preloadedState?: Partial<RootState>) => {
    return renderComponentWithProviders(<SettingsMenuItems />, {
      preloadedState,
    });
  };

  it('renders dropdown only when menu is visible', async () => {
    document.body.removeChild(settings);
    const view = createView();

    expect(
      screen.queryByLabelText('Default Colour Map')
    ).not.toBeInTheDocument();

    act(() => {
      document.body.appendChild(settings);
    });

    await screen.findByLabelText('Default Colour Map');

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

    await screen.findByLabelText('Default Colour Map');

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

    const select = screen.getByRole('combobox', { name: 'Default Colour Map' });
    await waitFor(() => expect(select).toHaveTextContent('cividis'));
    await user.click(select);

    const dropdown = screen.getByRole('listbox', {
      name: 'Default Colour Map',
    });
    await user.click(
      within(dropdown).getByRole('option', {
        name: 'inferno',
      })
    );
    await waitFor(() => expect(select).toHaveTextContent('inferno'));

    expect(invalidateQueriesSpy).toHaveBeenCalled();
  });

  it('lets user reverse a colourmap', async () => {
    createView();
    await waitFor(() =>
      expect(
        screen.getByRole('combobox', { name: 'Default Colour Map' })
      ).toHaveTextContent('cividis')
    );

    const reverseColourSwitch = screen.getByRole('checkbox', {
      name: 'Reverse Colour',
    });

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

    const extendedSelect = screen.getByLabelText('Default Colour Map');
    await user.click(extendedSelect);

    const extendedDropdown = screen.getByRole('listbox', {
      name: 'Default Colour Map',
    });

    await user.click(
      within(extendedDropdown).getByRole('option', { name: 'afmhot' })
    );

    expect(
      screen.getByRole('checkbox', {
        name: 'Reverse Colour',
      })
    ).toBeDisabled();
  });
});
