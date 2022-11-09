/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import FilterInput from './filterInput.component';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { operators, Token } from './filterParser';

const originalGetBoundingClientRect =
  window.Element.prototype.getBoundingClientRect;

describe('Filter input component', () => {
  let props: React.ComponentProps<typeof FilterInput>;

  beforeEach(() => {
    props = {
      error: '',
      value: [],
      setValue: jest.fn().mockImplementation((newValue) => {
        props.value = newValue;
      }),
      setError: jest.fn(),
      channels: [
        { type: 'channel', value: 'type', label: 'type' },
        { type: 'channel', value: 'shotnum', label: 'Shot Number' },
      ],
    };
    window.Element.prototype.getBoundingClientRect =
      originalGetBoundingClientRect;
  });

  it('renders a autocomplete with chips for any values the user has selected', async () => {
    const user = userEvent.setup();
    props.value = [
      { type: 'channel', value: 'type', label: 'type' },
      operators.find((t) => t.value === 'is not null')!,
    ];
    const view = render(<FilterInput {...props} />);

    // go left to test that chips are rendered both before and after the input
    const filter = screen.getByLabelText('Filter');
    await user.type(filter, '{arrowleft}');
    await user.tab();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders an error if there is one', () => {
    props.error = 'Test error';
    const view = render(<FilterInput {...props} />);

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('user can type in channels to the filter', async () => {
    const user = userEvent.setup();
    render(<FilterInput {...props} />);

    const filter = screen.getByLabelText('Filter');

    await user.type(filter, 'Shot num');
    await user.type(filter, '{enter}');

    expect(props.setValue).toHaveBeenCalledWith([
      { type: 'channel', value: 'shotnum', label: 'Shot Number' },
    ]);
    expect(props.setError).toHaveBeenCalledWith('');
  });

  it('user can type numbers to the filter', async () => {
    const user = userEvent.setup();
    render(<FilterInput {...props} />);

    const filter = screen.getByLabelText('Filter');

    await user.type(filter, '1');
    await user.type(filter, '{enter}');

    expect(props.setValue).toHaveBeenCalledWith([
      { type: 'number', value: '1', label: '1' },
    ]);
    expect(props.setError).toHaveBeenCalledWith('');
  });

  it('user can type custom strings to the filter if they are wrapped in double quotes', async () => {
    const user = userEvent.setup();
    render(<FilterInput {...props} />);

    const filter = screen.getByLabelText('Filter');

    await user.type(filter, '"test"');
    await user.type(filter, '{enter}');

    expect(props.setValue).toHaveBeenCalledWith([
      { type: 'string', value: '"test"', label: '"test"' },
    ]);
    expect(props.setError).toHaveBeenCalledWith('');
  });

  it('user can type custom strings to the filter if they are wrapped in single quotes', async () => {
    const user = userEvent.setup();
    render(<FilterInput {...props} />);

    const filter = screen.getByLabelText('Filter');

    await user.type(filter, "'test'");
    await user.type(filter, '{enter}');

    expect(props.setValue).toHaveBeenCalledWith([
      { type: 'string', value: "'test'", label: "'test'" },
    ]);
    expect(props.setError).toHaveBeenCalledWith('');
  });

  it("user can't type custom strings to the filter if they aren't wrapped in quotes", async () => {
    const user = userEvent.setup();
    render(<FilterInput {...props} />);

    const filter = screen.getByLabelText('Filter');

    await user.type(filter, 'test');
    await user.type(filter, '{enter}');

    expect(props.setValue).not.toHaveBeenCalled();
  });

  it('validates the value when the user stops focusing on the input and sets an error if invalid', async () => {
    const user = userEvent.setup();
    props.value = [
      { type: 'channel', value: 'type', label: 'type' },
      operators.find((t) => t.value === 'is not null')!,
      operators.find((t) => t.value === 'and')!,
    ];
    render(<FilterInput {...props} />);

    const filter = screen.getByLabelText('Filter');

    await user.type(filter, 'type');
    await user.type(filter, '{enter}');
    (props.setError as jest.Mock).mockClear();
    await user.tab();

    expect(props.setError).toHaveBeenCalledWith(
      // aka expect non-empty string
      expect.not.stringMatching(/^$/)
    );
  });

  it('validates the value when the user stops focusing on the input and clears an error if valid', async () => {
    const user = userEvent.setup();
    props.value = [
      { type: 'channel', value: 'type', label: 'type' },
      operators.find((t) => t.value === 'is not null')!,
    ];
    render(<FilterInput {...props} />);

    await user.tab();
    await user.tab();

    expect(props.setError).toHaveBeenCalledWith('');
  });

  it('user can modify the filter using arrow keys', async () => {
    const user = userEvent.setup();
    props.value = [
      { type: 'channel', value: 'shotnum', label: 'shotnum' },
      operators.find((t) => t.value === '<')!,
      { type: 'number', value: '1', label: '1' },
    ];
    const { rerender } = render(<FilterInput {...props} />);

    const filter = screen.getByLabelText('Filter');

    await user.type(filter, '{arrowleft}');
    await user.type(filter, '{backspace}');

    const expectedValue1: Token[] = [
      { type: 'channel', value: 'shotnum', label: 'shotnum' },
      { type: 'number', value: '1', label: '1' },
    ];
    expect(props.setValue).toHaveBeenCalledWith(expectedValue1);

    (props.setValue as jest.Mock).mockClear();
    rerender(<FilterInput {...props} />);

    await user.type(filter, '=');
    await user.type(filter, '{enter}');

    const expectedValue2: Token[] = [
      { type: 'channel', value: 'shotnum', label: 'shotnum' },
      operators.find((t) => t.value === '=')!,
      { type: 'number', value: '1', label: '1' },
    ];
    expect(props.setValue).toHaveBeenCalledWith(expectedValue2);

    (props.setValue as jest.Mock).mockClear();
    rerender(<FilterInput {...props} />);

    await user.type(filter, '{arrowright}');
    await user.type(filter, '{backspace}');

    const expectedValue3: Token[] = [
      { type: 'channel', value: 'shotnum', label: 'shotnum' },
      operators.find((t) => t.value === '=')!,
    ];
    expect(props.setValue).toHaveBeenCalledWith(expectedValue3);

    (props.setValue as jest.Mock).mockClear();
    rerender(<FilterInput {...props} />);

    await user.type(filter, '2');
    await user.type(filter, '{enter}');

    expect(props.setValue).toHaveBeenCalledWith([
      { type: 'channel', value: 'shotnum', label: 'shotnum' },
      operators.find((t) => t.value === '=')!,
      { type: 'number', value: '2', label: '2' },
    ]);
  });

  it('user can click on a cross to remove a chip, and the input stays in the same (relative) place', async () => {
    const user = userEvent.setup();
    props.value = [
      { type: 'number', value: '1', label: '1' },
      { type: 'number', value: '2', label: '2' },
      { type: 'number', value: '3', label: '3' },
      { type: 'number', value: '4', label: '4' },
      { type: 'number', value: '5', label: '5' },
    ];
    const { rerender } = render(<FilterInput {...props} />);

    const filter = screen.getByLabelText('Filter');

    await user.type(filter, '{arrowleft}');
    await user.type(filter, '{arrowleft}');

    let filterContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      filter.closest('[data-id="Input"]')?.children ?? []
    );
    // number of expected chips + input + fieldset label
    expect(filterContents.length).toBe(7);
    expect(filterContents[3].tagName).toBe('INPUT');

    await user.click(
      within(screen.getByRole('button', { name: '2' })).getByTestId(
        'CancelIcon'
      )
    );

    expect(props.setValue).toHaveBeenCalledWith([
      { type: 'number', value: '1', label: '1' },
      { type: 'number', value: '3', label: '3' },
      { type: 'number', value: '4', label: '4' },
      { type: 'number', value: '5', label: '5' },
    ]);

    // rerender to update the value prop
    rerender(<FilterInput {...props} />);

    filterContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      filter.closest('[data-id="Input"]')?.children ?? []
    );
    expect(filterContents.length).toBe(6);
    expect(filterContents[2].tagName).toBe('INPUT');

    await user.click(
      within(screen.getByRole('button', { name: '5' })).getByTestId(
        'CancelIcon'
      )
    );

    expect(props.setValue).toHaveBeenCalledWith([
      { type: 'number', value: '1', label: '1' },
      { type: 'number', value: '3', label: '3' },
      { type: 'number', value: '4', label: '4' },
    ]);

    // rerender to update the value prop
    rerender(<FilterInput {...props} />);

    filterContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      filter.closest('[data-id="Input"]')?.children ?? []
    );
    expect(filterContents.length).toBe(5);
    expect(filterContents[2].tagName).toBe('INPUT');
  });

  it("using the arrow keys only works when there's space to go (i.e. can't go left when we're at the start)", async () => {
    const user = userEvent.setup();
    props.value = [{ type: 'number', value: '1', label: '1' }];
    render(<FilterInput {...props} />);

    const filter = screen.getByLabelText('Filter');

    let filterContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      filter.closest('[data-id="Input"]')?.children ?? []
    );
    // number of expected chips + input + fieldset label
    expect(filterContents.length).toBe(3);
    expect(filterContents[1].tagName).toBe('INPUT');

    await user.type(filter, '{arrowright}');

    filterContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      filter.closest('[data-id="Input"]')?.children ?? []
    );
    expect(filterContents[1].tagName).toBe('INPUT');

    await user.type(filter, '{arrowleft}');

    filterContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      filter.closest('[data-id="Input"]')?.children ?? []
    );
    expect(filterContents[0].tagName).toBe('INPUT');

    await user.type(filter, '{arrowleft}');

    filterContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      filter.closest('[data-id="Input"]')?.children ?? []
    );
    expect(filterContents[0].tagName).toBe('INPUT');
  });

  it('user can click between tags to change input position when moving input backwards', async () => {
    window.Element.prototype.getBoundingClientRect = jest
      .fn()
      .mockReturnValue({ height: 10, width: 20, x: 10, y: 10 })
      .mockReturnValueOnce({ height: 0, width: 0, x: 0, y: 0 });

    props.value = [
      { type: 'number', value: '1', label: '1' },
      { type: 'number', value: '2', label: '2' },
    ];
    render(<FilterInput {...props} />);

    // eslint-disable-next-line testing-library/no-node-access
    const Input = screen.getByLabelText('Filter').closest('[data-id="Input"]')!;

    let filterContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      Input.children
    );
    // number of expected chips + input + fieldset label
    expect(filterContents.length).toBe(4);
    expect(filterContents[2].tagName).toBe('INPUT');

    fireEvent.click(Input, { clientX: 10, clientY: 5 });

    filterContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      Input.children
    );
    expect(filterContents[1].tagName).toBe('INPUT');
  });

  it('user can click between tags to change input position when moving input forwards', async () => {
    // we don't mock getBoundingClientRect here as it tests the case where we don't find a match
    // in this case we just put the filter at the end
    const user = userEvent.setup();
    props.value = [
      { type: 'number', value: '1', label: '1' },
      { type: 'number', value: '2', label: '2' },
    ];
    render(<FilterInput {...props} />);

    const filter = screen.getByLabelText('Filter');
    await user.type(filter, '{arrowleft}');
    await user.type(filter, '{arrowleft}');

    // eslint-disable-next-line testing-library/no-node-access
    const Input = filter.closest('[data-id="Input"]')!;

    let filterContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      Input.children
    );
    // number of expected chips + input + fieldset label
    expect(filterContents.length).toBe(4);
    expect(filterContents[0].tagName).toBe('INPUT');

    fireEvent.click(Input, { clientX: 10, clientY: 5 });

    filterContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      Input.children
    );
    expect(filterContents[2].tagName).toBe('INPUT');
  });

  it('user can click between tags to change input position even when tags "span multiple lines" (testing the overflow edge case)', async () => {
    window.Element.prototype.getBoundingClientRect = jest
      .fn()
      .mockReturnValueOnce({ height: 10, width: 10, x: 10, y: 10 })
      .mockReturnValueOnce({ height: 10, width: 10, x: 0, y: 20 })
      .mockReturnValueOnce({ height: 10, width: 10, x: 10, y: 10 })
      .mockReturnValue({ height: 0, width: 0, x: 0, y: 0 });

    props.value = [
      { type: 'number', value: '1', label: '1' },
      { type: 'number', value: '2', label: '2' },
    ];
    render(<FilterInput {...props} />);

    // eslint-disable-next-line testing-library/no-node-access
    const Input = screen.getByLabelText('Filter').closest('[data-id="Input"]')!;

    let filterContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      Input.children
    );
    // number of expected chips + input + fieldset label
    expect(filterContents.length).toBe(4);
    expect(filterContents[2].tagName).toBe('INPUT');

    fireEvent.click(Input, { clientX: 20, clientY: 5 });

    filterContents = Array.from(
      // eslint-disable-next-line testing-library/no-node-access
      Input.children
    );
    expect(filterContents[1].tagName).toBe('INPUT');
  });
});
