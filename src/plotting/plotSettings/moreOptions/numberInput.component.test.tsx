import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NumberInput from './numberInput.component';

describe('NumberInput', () => {
  it('should render without errors', () => {
    const view = render(<NumberInput />);
    expect(view).toMatchSnapshot();
  });

  it('should increment the value when the increment button is clicked', () => {
    render(<NumberInput max={2} value={1} />);
    const incrementButton = screen.getByRole('button', { name: 'increment' });
    const input = screen.getByRole('textbox');
    fireEvent.click(incrementButton);
    expect(input).toHaveValue('2');

    // should not increment beyond max
    fireEvent.click(incrementButton);
    expect(input).toHaveValue('2');
    expect(incrementButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('should decrement the value when the decrement button is clicked', () => {
    render(<NumberInput min={0} value={1} />);
    const decrementButton = screen.getByRole('button', { name: 'decrement' });
    const input = screen.getByRole('textbox');
    fireEvent.click(decrementButton);

    expect(input).toHaveValue('0');

    // should not decrement beyond min
    fireEvent.click(decrementButton);
    expect(input).toHaveValue('0');
    expect(decrementButton).toHaveAttribute('aria-disabled', 'true');
  });
});
