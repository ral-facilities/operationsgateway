import React from 'react';
import FilterInput from './filterInput.component';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Filter input component', () => {
  let props: React.ComponentProps<typeof FilterInput>;

  beforeEach(() => {
    props = {
      error: '',
      value: [],
      setValue: jest.fn(),
      setError: jest.fn(),
      channels: ['timestamp', 'shotnum'],
    };
  });

  it('renders a autocomplete with chips for any values the user has selected', () => {
    props.value = [
      { type: 'channel', value: 'timestamp' },
      { type: 'unaryop', value: 'is not null' },
    ];
    const view = render(<FilterInput {...props} />);

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

    await user.type(filter, 'timestamp');
    await user.type(filter, '{enter}');

    expect(props.setValue).toHaveBeenCalledWith([
      { type: 'channel', value: 'timestamp' },
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
      { type: 'number', value: '1' },
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
      { type: 'string', value: '"test"' },
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
      { type: 'string', value: "'test'" },
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
      { type: 'channel', value: 'timestamp' },
      { type: 'unaryop', value: 'is not null' },
      { type: 'and', value: 'and' },
    ];
    render(<FilterInput {...props} />);

    const filter = screen.getByLabelText('Filter');

    await user.type(filter, 'timestamp');
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
      { type: 'channel', value: 'timestamp' },
      { type: 'unaryop', value: 'is not null' },
    ];
    render(<FilterInput {...props} />);

    await user.tab();
    await user.tab();

    expect(props.setError).toHaveBeenCalledWith('');
  });
});
