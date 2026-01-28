/**
 * Unit tests for Input component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../input';

describe('Input Component', () => {
  test('renders input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  test('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  test('renders with different types', () => {
    const { rerender } = render(<Input type="text" placeholder="Text" />);
    expect(screen.getByPlaceholderText('Text')).toHaveAttribute('type', 'text');

    rerender(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" placeholder="Password" />);
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');
  });

  test('renders disabled input', () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  test('applies custom className', () => {
    render(<Input className="custom-class" placeholder="Custom" />);
    expect(screen.getByPlaceholderText('Custom')).toHaveClass('custom-class');
  });

  test('renders with value', () => {
    render(<Input value="initial value" readOnly placeholder="Value" />);
    expect(screen.getByDisplayValue('initial value')).toBeInTheDocument();
  });

  test('handles focus and blur events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} placeholder="Focus test" />);
    
    const input = screen.getByPlaceholderText('Focus test');
    
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  test('renders with aria attributes', () => {
    render(
      <Input 
        aria-label="Test input" 
        aria-describedby="help-text"
        placeholder="Aria test"
      />
    );
    
    const input = screen.getByPlaceholderText('Aria test');
    expect(input).toHaveAttribute('aria-label', 'Test input');
    expect(input).toHaveAttribute('aria-describedby', 'help-text');
  });
});
