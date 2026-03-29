import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as fc from 'fast-check';

vi.mock('../../services/health.js', () => ({
  ping: vi.fn(),
}));

vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

import { ping } from '../../services/health.js';
import { useAuth } from '../../context/AuthContext.jsx';

describe('LoginPage - Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: vi.fn() });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Property 3: Non-connected status is displayed to the user
   * Validates: Requirements 5.1, 5.4
   *
   * For any databaseStatus string that is not "connected", the LoginPage
   * should render the HealthStatusDisplay component showing the status text
   * and should NOT render the login form.
   */
  it('should display non-connected status and hide login form', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter(s => s !== 'connected'),
        async (databaseStatus) => {
          vi.clearAllMocks();
          useAuth.mockReturnValue({ login: vi.fn() });

          ping.mockResolvedValue({
            appName: 'test-app',
            appVersion: '1.0.0',
            timestamp: '2024-01-01T00:00:00Z',
            databaseStatus,
          });

          // Dynamic import to get a fresh LoginPage each iteration
          const { default: LoginPage } = await import('../LoginPage.jsx');

          const { container, unmount } = render(
            <MemoryRouter>
              <LoginPage />
            </MemoryRouter>
          );

          // Wait for the async ping to resolve and the component to update
          await waitFor(() => {
            expect(container.textContent).toContain(databaseStatus);
          });

          // Assert the login form submit button is NOT present
          const submitButton = container.querySelector('button[type="submit"]');
          expect(submitButton).toBeNull();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
