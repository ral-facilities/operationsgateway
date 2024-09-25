import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { FunctionToken, ValidateFunctionState } from '../app.types';
import FunctionsInputs, {
  FunctionsInputsProps,
} from './functionsInputs.component';

const channels: FunctionToken[] = [
  { label: 'Channel1', value: 'Channel1', type: 'channel' },
  { label: 'Channel2', value: 'Channel2', type: 'channel' },
];

const operators: FunctionToken[] = [
  { label: '+', value: '+', type: 'functionToken' },
  { label: '-', value: '-', type: 'functionToken' },
  { label: 'log', value: 'log', type: 'functionToken' },
];

const functions: FunctionToken[] = [
  { label: 'Function1', value: 'Function1', type: 'function' },
  { label: 'Function2', value: 'Function2', type: 'function' },
];

const value: ValidateFunctionState = {
  id: '1',
  name: '',
  expression: [],
  dataType: 'scalar',
  channels: [],
};

describe('FunctionsInputs', () => {
  let props: FunctionsInputsProps;
  let user: UserEvent;

  const setValue = vi.fn();
  const setError = vi.fn();
  const checkErrors = vi.fn();
  const createView = () => render(<FunctionsInputs {...props} />);
  beforeEach(() => {
    props = {
      channels: channels,
      operators: operators,
      functions: functions,
      value: value,
      error: {},
      setValue: setValue,
      setError: setError,
      checkErrors: checkErrors,
    };
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the name and expression input fields', () => {
    createView();
    const nameInput = screen.getByLabelText('Name');
    expect(nameInput).toBeInTheDocument();
    const expressionInput = screen.getByLabelText('Expression');
    expect(expressionInput).toBeInTheDocument();
  });

  it('user can type name in nameInput', async () => {
    createView();

    const nameInput = screen.getByLabelText('Name');

    fireEvent.change(nameInput, {
      target: { value: 'test' },
    });

    expect(setValue).toHaveBeenCalledWith({ name: 'test' });
    expect(setError).toHaveBeenCalledWith(undefined);
  });

  it('displays error messages for names and clears it when value is editing', async () => {
    props.value = {
      ...props.value,
      name: 'test',
    };
    props.error = { name: { message: 'Name error' } };
    createView();

    expect(screen.getByText('Name error')).toBeInTheDocument();
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, {
      target: { value: 'test2' },
    });

    expect(setValue).toHaveBeenCalledWith({ name: 'test2' });
    expect(setError).toHaveBeenCalledWith(undefined);
  });

  it('displays error messages for the expression and clears it when value is editing', async () => {
    props.value = {
      ...props.value,
      name: 'test',
    };
    props.error = { expression: { message: 'Expression error' } };
    createView();

    expect(screen.getByText('Expression error')).toBeInTheDocument();
    const expressionInput = screen.getByLabelText('Expression');

    await user.type(expressionInput, '1');
    await user.type(expressionInput, '{enter}');

    expect(setValue).toHaveBeenCalledWith({
      expression: [{ label: '1', type: 'number', value: '1' }],
    });
  });

  it('user can type numbers to the expressionInput', async () => {
    createView();

    const expressionInput = screen.getByLabelText('Expression');

    await user.type(expressionInput, '1');
    await user.type(expressionInput, '{enter}');

    expect(setValue).toHaveBeenCalledWith({
      expression: [{ label: '1', type: 'number', value: '1' }],
    });
  });

  it('user can type numbers to the expressionInput using space bar', async () => {
    createView();

    const expressionInput = screen.getByLabelText('Expression');

    await user.type(expressionInput, '1');
    await user.type(expressionInput, ' ');

    expect(setValue).toHaveBeenCalledWith({
      expression: [{ label: '1', type: 'number', value: '1' }],
    });
    expect(setError).toHaveBeenCalledWith(undefined);
  });

  it('user can type in channels to the expressionInput', async () => {
    createView();

    const expressionInput = screen.getByLabelText('Expression');

    await user.type(expressionInput, 'Channel1');
    await user.type(expressionInput, '{enter}');

    expect(setValue).toHaveBeenCalledWith({
      expression: [{ label: 'Channel1', type: 'channel', value: 'Channel1' }],
    });
  });

  it('user can type in channels to the expressionInput using space bar', async () => {
    createView();

    const expressionInput = screen.getByLabelText('Expression');

    await user.type(expressionInput, 'Channel1');
    await user.type(expressionInput, ' ');

    expect(setValue).toHaveBeenCalledWith({
      expression: [{ label: 'Channel1', type: 'channel', value: 'Channel1' }],
    });
    expect(setError).toHaveBeenCalledWith(undefined);
  });

  it('user can type in operator to the expressionInput', async () => {
    createView();

    const expressionInput = screen.getByLabelText('Expression');

    await user.type(expressionInput, '+');
    await user.type(expressionInput, '{enter}');

    expect(setValue).toHaveBeenCalledWith({
      expression: [{ label: '+', type: 'functionToken', value: '+' }],
    });
  });

  it('user can type in operator to the expressionInput when there is only one operator available', async () => {
    createView();

    const expressionInput = screen.getByLabelText('Expression');

    await user.type(expressionInput, 'lo');
    await user.type(expressionInput, '{enter}');

    expect(setValue).toHaveBeenCalledWith({
      expression: [{ label: 'log', type: 'functionToken', value: 'log' }],
    });
  });

  it('user can type in operator to the expressionInput using space bar', async () => {
    createView();

    const expressionInput = screen.getByLabelText('Expression');

    await user.type(expressionInput, '+');
    await user.type(expressionInput, ' ');

    expect(setValue).toHaveBeenCalledWith({
      expression: [{ label: '+', type: 'functionToken', value: '+' }],
    });
    expect(setError).toHaveBeenCalledWith(undefined);
  });

  it('user can type in operator to the expressionInput using space bar when there is only one operator available', async () => {
    createView();

    const expressionInput = screen.getByLabelText('Expression');

    await user.type(expressionInput, 'lo');
    await user.type(expressionInput, ' ');

    expect(setValue).toHaveBeenCalledWith({
      expression: [{ label: 'log', type: 'functionToken', value: 'log' }],
    });
    expect(setError).toHaveBeenCalledWith(undefined);
  });

  it("user can't type custom strings in the expression input", async () => {
    createView();

    const expressionInput = screen.getByLabelText('Expression');

    await user.type(expressionInput, 'test');
    await user.type(expressionInput, '{enter}');

    expect(setValue).not.toHaveBeenCalled();
  });

  it('user can modify the expression using arrow keys', async () => {
    props.value = {
      ...props.value,
      name: 'test',
      expression: [
        { label: '1', value: '1', type: 'number' },
        { label: '+', value: '+', type: 'functionToken' },
        { label: '1', value: '1', type: 'number' },
      ],
    };
    const { rerender } = createView();

    const expressionInput = screen.getByLabelText('Expression');

    await user.type(expressionInput, '{arrowleft}');
    await user.type(expressionInput, '{backspace}');

    expect(setValue).toHaveBeenCalledWith({
      expression: [
        { label: '1', type: 'number', value: '1' },
        { label: '1', type: 'number', value: '1' },
      ],
    });

    vi.mocked(setValue).mockClear();
    rerender(<FunctionsInputs {...props} />);

    await user.type(expressionInput, '+');
    await user.type(expressionInput, '{enter}');

    expect(props.setValue).toHaveBeenCalledWith({
      expression: [
        { label: '1', type: 'number', value: '1' },
        { label: '+', type: 'functionToken', value: '+' },
        { label: '+', type: 'functionToken', value: '+' },
        { label: '1', type: 'number', value: '1' },
      ],
    });
    vi.mocked(setValue).mockClear();
    rerender(<FunctionsInputs {...props} />);

    await user.type(expressionInput, '{arrowright}');
    await user.type(expressionInput, '{backspace}');

    expect(props.setValue).toHaveBeenCalledWith({
      expression: [
        { label: '1', type: 'number', value: '1' },
        { label: '+', type: 'functionToken', value: '+' },
      ],
    });

    vi.mocked(setValue).mockClear();
    rerender(<FunctionsInputs {...props} />);

    await user.type(expressionInput, '2');
    await user.type(expressionInput, '{enter}');

    expect(setValue).toHaveBeenCalledWith({
      expression: [
        { label: '1', type: 'number', value: '1' },
        { label: '+', type: 'functionToken', value: '+' },
        { label: '2', type: 'number', value: '2' },
        { label: '1', type: 'number', value: '1' },
      ],
    });
  });

  it('user can click on a cross to remove a chip, and the input stays in the same (relative) place', async () => {
    props.value = {
      ...props.value,
      name: 'test',
      expression: [
        { type: 'number', value: '1', label: '1' },
        { type: 'number', value: '2', label: '2' },
        { type: 'number', value: '3', label: '3' },
        { type: 'number', value: '4', label: '4' },
        { type: 'number', value: '5', label: '5' },
      ],
    };
    const { rerender } = createView();

    const expressionInput = screen.getByLabelText('Expression');

    await user.type(expressionInput, '{arrowleft}');
    await user.type(expressionInput, '{arrowleft}');

    await user.click(
      within(screen.getByRole('button', { name: '2' })).getByTestId(
        'CancelIcon'
      )
    );

    expect(setValue).toHaveBeenCalledWith({
      expression: [
        { label: '1', type: 'number', value: '1' },
        { label: '3', type: 'number', value: '3' },
        { label: '4', type: 'number', value: '4' },
        { label: '5', type: 'number', value: '5' },
      ],
    });

    // rerender to update the value prop
    rerender(<FunctionsInputs {...props} />);

    await user.click(
      within(screen.getByRole('button', { name: '5' })).getByTestId(
        'CancelIcon'
      )
    );

    expect(setValue).toHaveBeenCalledWith({
      expression: [
        { label: '1', type: 'number', value: '1' },
        { label: '2', type: 'number', value: '2' },
        { label: '3', type: 'number', value: '3' },
        { label: '4', type: 'number', value: '4' },
      ],
    });
  });

  it('user can click between tags to change input position when moving input backwards', async () => {
    window.Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ height: 10, width: 20, x: 10, y: 10 })
      .mockReturnValueOnce({ height: 0, width: 0, x: 0, y: 0 });

    props.value = {
      ...props.value,
      name: 'test',
      expression: [
        { type: 'number', value: '1', label: '1' },
        { type: 'number', value: '2', label: '2' },
      ],
    };
    createView();

    const Input = screen
      .getByLabelText('Expression')
      // eslint-disable-next-line testing-library/no-node-access
      .closest('[data-id="Input"]')!;

    let expressionContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      Input.children
    );
    // number of expected chips + input + fieldset label
    expect(expressionContents.length).toBe(4);
    expect(expressionContents[2].tagName).toBe('INPUT');

    fireEvent.click(Input, { clientX: 10, clientY: 5 });

    expressionContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      Input.children
    );
    expect(expressionContents[1].tagName).toBe('INPUT');
  });

  it('user can click between tags to change input position when moving input forwards', async () => {
    // we don't mock getBoundingClientRect here as it tests the case where we don't find a match
    // in this case we just put the filter at the end
    props.value = {
      ...props.value,
      name: 'test',
      expression: [
        { type: 'number', value: '1', label: '1' },
        { type: 'number', value: '2', label: '2' },
      ],
    };
    createView();

    const expressionInput = screen.getByLabelText('Expression');
    await user.type(expressionInput, '{arrowleft}');
    await user.type(expressionInput, '{arrowleft}');

    // eslint-disable-next-line testing-library/no-node-access
    const Input = expressionInput.closest('[data-id="Input"]')!;

    let expressionContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      Input.children
    );
    // number of expected chips + input + fieldset label
    expect(expressionContents.length).toBe(4);
    expect(expressionContents[0].tagName).toBe('INPUT');

    fireEvent.click(Input, { clientX: 20, clientY: 5 });

    expressionContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      Input.children
    );

    expect(expressionContents[2].tagName).toBe('INPUT');
  });

  it('user can click between tags to change input position even when tags "span multiple lines" (testing the overflow edge case)', async () => {
    window.Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValueOnce({ height: 10, width: 10, x: 10, y: 10 })
      .mockReturnValueOnce({ height: 10, width: 10, x: 0, y: 20 })
      .mockReturnValueOnce({ height: 10, width: 10, x: 10, y: 10 })
      .mockReturnValue({ height: 0, width: 0, x: 0, y: 0 });

    props.value = {
      ...props.value,
      name: 'test',
      expression: [
        { type: 'number', value: '1', label: '1' },
        { type: 'number', value: '2', label: '2' },
      ],
    };
    createView();

    const Input = screen
      .getByLabelText('Expression')
      // eslint-disable-next-line testing-library/no-node-access
      .closest('[data-id="Input"]')!;

    let expressionContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      Input.children
    );
    // number of expected chips + input + fieldset label
    expect(expressionContents.length).toBe(4);
    expect(expressionContents[2].tagName).toBe('INPUT');

    fireEvent.click(Input, { clientX: 20, clientY: 5 });

    expressionContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      Input.children
    );
    expect(expressionContents[1].tagName).toBe('INPUT');
  });
});
