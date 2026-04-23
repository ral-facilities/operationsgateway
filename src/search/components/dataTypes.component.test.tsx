import { render, screen, type RenderResult } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { initialState as initialConfigState } from '../../state/slices/configSlice';
import { RootState, setupStore } from '../../state/store';
import DataTypes, { type DataTypesProps } from './dataTypes.component';

describe('data types selector', () => {
  let user: UserEvent;
  let props: DataTypesProps;
  const changeSelectedDataTypes = vi.fn();
  const searchParamsUpdated = vi.fn();
  let state: Partial<RootState>;

  const createView = (): RenderResult => {
    return render(<DataTypes {...props} />, {
      wrapper: ({ children }) => (
        <Provider store={setupStore(state)}>{children}</Provider>
      ),
    });
  };

  beforeEach(() => {
    user = userEvent.setup();
    state = {
      config: { ...initialConfigState, dataTypes: ['GS', 'GD', 'GA', 'GQ'] },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with a list of data types with some selected and some not selected', () => {
    props = {
      selectedDataTypes: ['GS', 'GA'],
      changeSelectedDataTypes,
      searchParamsUpdated,
    };

    const { asFragment } = createView();
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls changeDataTypes when user clicks', async () => {
    props = {
      selectedDataTypes: ['GA'],
      changeSelectedDataTypes,
      searchParamsUpdated,
    };
    createView();

    await user.click(screen.getByRole('checkbox', { name: 'GS' }));
    expect(changeSelectedDataTypes).toHaveBeenCalledWith(expect.any(Function));
    expect(searchParamsUpdated).toHaveBeenCalled();
  });

  it('renders error when no types selected', async () => {
    props = {
      selectedDataTypes: [],
      changeSelectedDataTypes,
      searchParamsUpdated,
    };
    createView();

    expect(screen.getByText('Please select a data type')).toBeInTheDocument();
  });
});
