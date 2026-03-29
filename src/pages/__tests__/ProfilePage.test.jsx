import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

import ProfilePage from '../ProfilePage.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderProfilePage() {
  return render(
    <MemoryRouter initialEntries={['/profile']}>
      <ProfilePage />
    </MemoryRouter>
  );
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: { userId: 1, name: 'John Doe', email: 'john@example.com' },
      logout: mockLogout,
    });
  });

  it('should display user name and email', () => {
    renderProfilePage();

    expect(screen.getByText('John Doe')).not.toBeNull();
    expect(screen.getByText('john@example.com')).not.toBeNull();
  });

  it('should call logout and navigate to /login when logout button is clicked', async () => {
    mockLogout.mockResolvedValue(undefined);
    renderProfilePage();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
