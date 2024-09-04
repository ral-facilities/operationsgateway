import { QueryClient } from '@tanstack/react-query';
import { act, screen, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { RootState } from '../state/store';
import { getInitialState, renderComponentWithProviders } from '../testUtils';
import FunctionsDialog, {
  FunctionsDialogProps,
} from './functionsDialog.component';
describe('FunctionsDialog', () => {
  let props: FunctionsDialogProps;
  let user: UserEvent;
  let state: RootState;

  const onClose = vi.fn();

  const createView = (
    initialState?: Partial<RootState>,
    queryClient?: QueryClient
  ) => {
    return renderComponentWithProviders(<FunctionsDialog {...props} />, {
      preloadedState: initialState,
      queryClient,
    });
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      flashingFunctionValue: '',
    };
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders functions dialog when dialog is open', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    expect(await screen.findByText('Waveform Analysis')).toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();
  });

  it('calls onClose when close button is clicked', async () => {
    createView();

    await user.click(screen.getByText('Close'));

    expect(onClose).toHaveBeenCalled();
  });

  it('dispatches changeAppliedFunctions and onClose when apply button is clicked (number)', async () => {
    const state = {
      ...getInitialState(),
    };

    const { store } = createView(state);

    const checkBox = screen.getByLabelText('Unnamed Function Checkbox');

    await user.click(checkBox);

    const nameInput = screen.getByLabelText('Name');

    await user.type(nameInput, 'a');

    const expressionInput = screen.getByLabelText('Expression');

    await user.type(expressionInput, '1{enter}');

    expect(screen.getByText('Apply')).not.toBeDisabled();
    await user.click(screen.getByText('Apply'));

    expect(store.getState().functions.appliedFunctions).toStrictEqual([
      {
        channels: [],
        dataType: 'scalar',
        expression: [{ label: '1', type: 'number', value: '1' }],
        id: expect.anything(),
        name: 'a',
      },
    ]);
    expect(onClose).toHaveBeenCalled();
  });

  it('checks checkboxes of the visible functions on the table and can remove functions from the table when unchecked', async () => {
    state = {
      ...getInitialState(),
      functions: {
        appliedFunctions: [
          {
            id: '1',
            name: 'a',
            expression: [{ type: 'number', label: '3', value: '3' }],
            dataType: 'scalar',
            channels: [],
          },
          {
            id: '2',
            name: 'b',
            expression: [{ type: 'number', label: '2', value: '2' }],
            dataType: 'scalar',
            channels: [],
          },
        ],
      },
      table: {
        ...getInitialState().table,
        selectedColumnIds: ['a'],
      },
    };

    createView(state);

    const checkBoxA = within(screen.getByLabelText('a Checkbox')).getByRole(
      'checkbox'
    );

    const checkBoxB = within(screen.getByLabelText('b Checkbox')).getByRole(
      'checkbox'
    );

    expect(checkBoxA).toBeChecked();
    expect(checkBoxB).not.toBeChecked();

    await user.click(checkBoxA);
    await user.click(checkBoxB);

    expect(checkBoxA).not.toBeChecked();
    expect(checkBoxB).toBeChecked();
  });

  it('dispatches changeAppliedFunctions and onClose when apply button is clicked (channel)', async () => {
    const state = {
      ...getInitialState(),
    };

    const { store } = createView(state);

    const nameInput = screen.getByLabelText('Name');

    await user.type(nameInput, 'b');

    const expressionInput = screen.getByLabelText('Expression');

    await user.type(expressionInput, 'Channel_EFG{enter}');

    expect(screen.getByText('Apply')).not.toBeDisabled();
    await user.click(screen.getByText('Apply'));

    expect(store.getState().functions.appliedFunctions).toStrictEqual([
      {
        channels: ['CHANNEL_EFGHI'],
        dataType: 'image',
        expression: [
          { label: 'Channel_EFGHI', type: 'channel', value: 'CHANNEL_EFGHI' },
        ],
        id: expect.anything(),
        name: 'b',
      },
    ]);
    expect(onClose).toHaveBeenCalled();
  });

  it('display error message for invalid functions and clears error message and sends a valid request (multiple functions)', async () => {
    const state = {
      ...getInitialState(),
    };

    const { store } = createView(state);

    const nameInput = screen.getByLabelText('Name');

    await user.type(nameInput, 'b');

    const expressionInput = screen.getByLabelText('Expression');

    await user.type(expressionInput, 'Channel_EFG{enter}');

    const addFunction = screen.getByRole('button', {
      name: 'Add new function',
    });

    await user.click(addFunction);

    await user.type(screen.getAllByLabelText('Name')[1], 'c');

    await user.type(
      screen.getAllByLabelText('Expression')[1],
      'Channel_FGH{enter}'
    );
    await user.click(addFunction);

    await user.type(screen.getAllByLabelText('Name')[2], 'a');

    await user.type(screen.getAllByLabelText('Expression')[2], 'b');
    await user.type(screen.getAllByLabelText('Expression')[2], ' ');
    await user.type(screen.getAllByLabelText('Expression')[2], '+');
    await user.type(screen.getAllByLabelText('Expression')[2], ' ');
    await user.type(
      screen.getAllByLabelText('Expression')[2],
      'c{arrowdown}{arrowdown}{arrowdown}{enter}'
    );

    expect(screen.getByText('Apply')).not.toBeDisabled();
    await user.click(screen.getByText('Apply'));
    expect(
      await screen.findByText(
        "Operation between types ['image', 'waveform'] not supported"
      )
    ).toBeInTheDocument();

    expect(screen.getByText('Apply')).toBeDisabled();

    expect(onClose).not.toHaveBeenCalled();

    const deleteButtons = screen.getAllByLabelText('Delete function');

    await user.click(deleteButtons[2]);

    expect(
      screen.queryByText(
        "Operation between types ['image', 'waveform'] not supported"
      )
    ).not.toBeInTheDocument();
    expect(screen.getByText('Apply')).not.toBeDisabled();
    await user.click(screen.getByText('Apply'));

    expect(store.getState().functions.appliedFunctions).toStrictEqual([
      {
        channels: ['CHANNEL_EFGHI'],
        dataType: 'image',
        expression: [
          { label: 'Channel_EFGHI', type: 'channel', value: 'CHANNEL_EFGHI' },
        ],
        id: expect.anything(),
        name: 'b',
      },
      {
        channels: ['CHANNEL_FGHIJ'],
        dataType: 'waveform',
        expression: [
          {
            label: 'Channel_FGHIJ',
            type: 'channel',
            value: 'CHANNEL_FGHIJ',
          },
        ],
        id: expect.anything(),
        name: 'c',
      },
    ]);
    expect(onClose).toHaveBeenCalled();
  });

  it('display error message for invalid functions (multiple empty functions)', async () => {
    const state = {
      ...getInitialState(),
    };

    createView(state);

    const addFunction = screen.getByRole('button', {
      name: 'Add new function',
    });

    await user.click(addFunction);

    await user.click(addFunction);

    await user.click(addFunction);

    expect(screen.getByText('Apply')).not.toBeDisabled();
    await user.click(screen.getByText('Apply'));
    // Await the promise and then check the length
    const errorMessages = await screen.findAllByText(
      'String should have at least 1 character'
    );
    expect(errorMessages.length).toEqual(8);
  });

  it('display error message for name of a function and clears error message and sends a valid request', async () => {
    const state = {
      ...getInitialState(),
    };

    const { store } = createView(state);

    const nameInput = screen.getByLabelText('Name');

    await user.type(nameInput, '1');

    const expressionInput = screen.getByLabelText('Expression');

    await user.type(expressionInput, '1{enter}');

    expect(screen.getByText('Apply')).not.toBeDisabled();
    await user.click(screen.getByText('Apply'));
    expect(
      await screen.findByText(
        "name '1' must start with a letter, and can only contain letters, digits, '-' or '_' characters"
      )
    ).toBeInTheDocument();

    expect(screen.getByText('Apply')).toBeDisabled();

    expect(onClose).not.toHaveBeenCalled();

    await user.clear(nameInput);
    await user.type(nameInput, 'a');

    expect(
      screen.queryByText(
        "name '1' must start with a letter, and can only contain letters, digits, '-' or '_' characters"
      )
    ).not.toBeInTheDocument();
    expect(screen.getByText('Apply')).not.toBeDisabled();
    await user.click(screen.getByText('Apply'));

    expect(store.getState().functions.appliedFunctions).toStrictEqual([
      {
        channels: [],
        dataType: 'scalar',
        expression: [{ label: '1', type: 'number', value: '1' }],
        id: expect.anything(),
        name: 'a',
      },
    ]);
    expect(onClose).toHaveBeenCalled();
  });
});
