import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Basic Test Setup', () => {
  it('should run a simple test correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should render basic JSX', () => {
    render(<div>Hello Vitest!</div>);
    // basic check to ensure React Testing Library is working
    expect(screen.getByText('Hello Vitest!')).toBeTruthy();
  });
});
