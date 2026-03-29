import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HealthStatusDisplay from '../HealthStatusDisplay.jsx';

describe('HealthStatusDisplay - Unit Tests', () => {
  /**
   * Validates: Requirement 5.4
   */
  it('should render the provided status text in a status region', () => {
    render(<HealthStatusDisplay databaseStatus="initializing" />);

    const statusEl = screen.getByRole('status');
    expect(statusEl).toBeDefined();
    expect(statusEl.textContent).toContain('initializing');
  });
});
