import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import PlotSettingsTextField from './plotSettingsTextField.component';

describe('PlotSettingsTextField', () => {
  it('renders correctly', () => {
    render(
      <PlotSettingsTextField
        label="value field"
        value="test value"
        onChange={jest.fn()}
      />
    );

    expect(
      screen.getByRole('textbox', { name: 'value field' })
    ).toBeInTheDocument();
  });

  it('lets user change the plot title and calls changePlotTitle', async () => {
    const user = userEvent.setup();
    // this is adapted from the recommended way of testing controlled inputs with testing-library
    // https://github.com/testing-library/user-event/issues/549
    function TestEnv() {
      const [value, setValue] = React.useState('initial value');
      return (
        <PlotSettingsTextField
          label="test field"
          value={value}
          onChange={setValue}
        />
      );
    }

    render(<TestEnv />);

    const field = screen.getByRole('textbox', { name: 'test field' });
    expect(field).toHaveValue('initial value');

    await user.clear(field);
    await user.type(field, 'new value');

    expect(field).toHaveValue('new value');
  });
});
