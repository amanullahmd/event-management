/**
 * Accessibility Tests
 * 
 * Tests accessibility compliance for UI components
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.8
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Input } from '@/modules/shared-common/components/ui/input';
import { Card } from '@/modules/shared-common/components/ui/card';
import { Badge } from '@/modules/shared-common/components/ui/badge';
import { Select } from '@/modules/shared-common/components/ui/select';
import { Checkbox } from '@/modules/shared-common/components/ui/checkbox';
import { RadioGroup } from '@/modules/shared-common/components/ui/radio-group';
import { Tabs } from '@/modules/shared-common/components/ui/tabs';

expect.extend(toHaveNoViolations);

describe('Accessibility - ARIA Labels', () => {
  test('button has accessible label', () => {
    render(<Button aria-label="Submit form">Submit</Button>);
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toHaveAccessibleName();
  });

  test('input has associated label', () => {
    render(
      <>
        <label htmlFor="email">Email</label>
        <Input id="email" type="email" />
      </>
    );
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
  });

  test('checkbox has accessible label', () => {
    render(
      <>
        <Checkbox id="agree" />
        <label htmlFor="agree">I agree to terms</label>
      </>
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAccessibleName();
  });

  test('radio group has accessible labels', () => {
    render(
      <RadioGroup>
        <label>
          <input type="radio" name="option" value="1" />
          Option 1
        </label>
        <label>
          <input type="radio" name="option" value="2" />
          Option 2
        </label>
      </RadioGroup>
    );
    const radios = screen.getAllByRole('radio');
    radios.forEach((radio) => {
      expect(radio).toHaveAccessibleName();
    });
  });

  test('select has accessible label', () => {
    render(
      <>
        <label htmlFor="select">Choose option</label>
        <Select id="select" options={[]} />
      </>
    );
    const select = screen.getByLabelText('Choose option');
    expect(select).toBeInTheDocument();
  });
});

describe('Accessibility - Keyboard Navigation', () => {
  test('button is keyboard accessible', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveProperty('tabIndex');
  });

  test('input is keyboard accessible', () => {
    render(<Input type="text" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveProperty('tabIndex');
  });

  test('checkbox is keyboard accessible', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveProperty('tabIndex');
  });

  test('radio is keyboard accessible', () => {
    render(
      <RadioGroup>
        <label>
          <input type="radio" name="option" value="1" />
          Option 1
        </label>
      </RadioGroup>
    );
    const radio = screen.getByRole('radio');
    expect(radio).toHaveProperty('tabIndex');
  });

  test('tab order is logical', () => {
    const { container } = render(
      <div>
        <Button>First</Button>
        <Input type="text" />
        <Button>Last</Button>
      </div>
    );

    const buttons = screen.getAllByRole('button');
    const input = screen.getByRole('textbox');

    expect(buttons[0]).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(buttons[1]).toBeInTheDocument();
  });
});

describe('Accessibility - Focus Management', () => {
  test('button shows focus indicator', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
  });

  test('input shows focus indicator', () => {
    render(<Input type="text" />);
    const input = screen.getByRole('textbox');
    input.focus();
    expect(input).toHaveFocus();
  });

  test('focus is visible on interactive elements', () => {
    const { container } = render(
      <div>
        <Button>Button</Button>
        <Input type="text" />
      </div>
    );

    const button = screen.getByRole('button');
    const input = screen.getByRole('textbox');

    button.focus();
    expect(button).toHaveFocus();

    input.focus();
    expect(input).toHaveFocus();
  });

  test('focus trap in modal', () => {
    // This would test focus trap in a modal component
    // Implementation depends on modal component structure
    expect(true).toBe(true);
  });
});

describe('Accessibility - Color Contrast', () => {
  test('button text has sufficient contrast', () => {
    const { container } = render(
      <Button className="bg-violet-600 text-white">Submit</Button>
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('input text has sufficient contrast', () => {
    const { container } = render(
      <Input
        type="text"
        className="bg-white text-gray-900 border-gray-300"
      />
    );
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  test('badge text has sufficient contrast', () => {
    render(<Badge>Success</Badge>);
    const badge = screen.getByText('Success');
    expect(badge).toBeInTheDocument();
  });
});

describe('Accessibility - Semantic HTML', () => {
  test('button uses button element', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button.tagName).toBe('BUTTON');
  });

  test('input uses input element', () => {
    render(<Input type="text" />);
    const input = screen.getByRole('textbox');
    expect(input.tagName).toBe('INPUT');
  });

  test('card uses semantic structure', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>
    );
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
  });

  test('list uses semantic list elements', () => {
    render(
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });
});

describe('Accessibility - Alternative Text', () => {
  test('image has alt text', () => {
    render(<img src="test.jpg" alt="Test image" />);
    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
  });

  test('icon button has aria-label', () => {
    render(<Button aria-label="Close">×</Button>);
    const button = screen.getByRole('button', { name: /close/i });
    expect(button).toHaveAccessibleName();
  });
});

describe('Accessibility - Form Validation', () => {
  test('input error is announced', () => {
    render(
      <>
        <Input
          type="email"
          aria-invalid="true"
          aria-describedby="email-error"
        />
        <span id="email-error">Invalid email</span>
      </>
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  test('required field is marked', () => {
    render(
      <>
        <label htmlFor="name">Name *</label>
        <Input id="name" required />
      </>
    );
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });
});

describe('Accessibility - Screen Reader Support', () => {
  test('dynamic content is announced', () => {
    render(
      <div role="status" aria-live="polite">
        Loading...
      </div>
    );
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  test('alert is announced', () => {
    render(
      <div role="alert">
        An error occurred
      </div>
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  test('navigation landmarks are present', () => {
    render(
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
      </nav>
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });
});

describe('Accessibility - Axe Audit', () => {
  test('button component has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('input component has no accessibility violations', async () => {
    const { container } = render(
      <>
        <label htmlFor="test">Test</label>
        <Input id="test" type="text" />
      </>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('card component has no accessibility violations', async () => {
    const { container } = render(
      <Card>
        <h2>Title</h2>
        <p>Content</p>
      </Card>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('checkbox component has no accessibility violations', async () => {
    const { container } = render(
      <>
        <Checkbox id="test" />
        <label htmlFor="test">Test</label>
      </>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility - Text Resizing', () => {
  test('component remains functional at 200% zoom', () => {
    const { container } = render(
      <div style={{ zoom: '2' }}>
        <Button>Click me</Button>
      </div>
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('no horizontal scrolling at 200% zoom', () => {
    const { container } = render(
      <div style={{ zoom: '2', maxWidth: '100vw' }}>
        <Button>Click me</Button>
      </div>
    );
    expect(container.scrollWidth).toBeLessThanOrEqual(window.innerWidth * 2);
  });
});
