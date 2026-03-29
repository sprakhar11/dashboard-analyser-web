import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../services/health.js', () => ({
  ping: vi.fn(),
}));

import { usePing } from '../usePing.js';
import { ping } from '../../services/health.js';

describe('usePing hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Validates: Requirement 3.3
   */
  it('should start in loading state', () => {
    ping.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => usePing());

    expect(result.current.status).toBe('loading');
    expect(result.current.databaseStatus).toBeNull();
    expect(result.current.error).toBeNull();
  });

  /**
   * Validates: Requirements 3.1, 5.3
   */
  it('should transition to connected when databaseStatus is "connected"', async () => {
    ping.mockResolvedValue({
      appName: 'app',
      appVersion: '1.0',
      timestamp: '2024-01-01',
      databaseStatus: 'connected',
    });

    const { result } = renderHook(() => usePing());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.status).toBe('connected');
    expect(result.current.databaseStatus).toBe('connected');
    expect(result.current.error).toBeNull();
  });

  /**
   * Validates: Requirements 5.1, 5.2
   */
  it('should transition to disconnected when databaseStatus is not "connected"', async () => {
    ping.mockResolvedValue({
      appName: 'app',
      appVersion: '1.0',
      timestamp: '2024-01-01',
      databaseStatus: 'initializing',
    });

    const { result } = renderHook(() => usePing());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.status).toBe('disconnected');
    expect(result.current.databaseStatus).toBe('initializing');
    expect(result.current.error).toBeNull();
  });

  /**
   * Validates: Requirement 3.4
   */
  it('should transition to error on ping failure', async () => {
    ping.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => usePing());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.databaseStatus).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  /**
   * Validates: Requirement 5.2
   */
  it('should poll every 10 seconds when disconnected', async () => {
    ping.mockResolvedValue({
      appName: 'app',
      appVersion: '1.0',
      timestamp: '2024-01-01',
      databaseStatus: 'initializing',
    });

    renderHook(() => usePing());

    // Resolve initial ping
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(ping).toHaveBeenCalledTimes(1);

    // Advance 10 seconds to trigger poll
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });

    expect(ping).toHaveBeenCalledTimes(2);
  });

  /**
   * Validates: Requirement 3.4
   */
  it('should poll every 10 seconds when in error state', async () => {
    ping.mockRejectedValue(new Error('Network error'));

    renderHook(() => usePing());

    // Resolve initial ping (error)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(ping).toHaveBeenCalledTimes(1);

    // Advance 10 seconds to trigger retry
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });

    expect(ping).toHaveBeenCalledTimes(2);
  });

  /**
   * Validates: Requirement 5.3
   */
  it('should stop polling when status becomes connected', async () => {
    // First call: disconnected, second call: connected
    ping
      .mockResolvedValueOnce({
        appName: 'app',
        appVersion: '1.0',
        timestamp: '2024-01-01',
        databaseStatus: 'initializing',
      })
      .mockResolvedValueOnce({
        appName: 'app',
        appVersion: '1.0',
        timestamp: '2024-01-01',
        databaseStatus: 'connected',
      });

    const { result } = renderHook(() => usePing());

    // Resolve initial ping
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.status).toBe('disconnected');

    // Advance to trigger poll — should become connected
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });

    expect(result.current.status).toBe('connected');

    // Advance again — should NOT trigger another call
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });

    expect(ping).toHaveBeenCalledTimes(2);
  });

  /**
   * Validates: Requirement 5.2 (cleanup)
   */
  it('should clear interval on unmount', async () => {
    ping.mockResolvedValue({
      appName: 'app',
      appVersion: '1.0',
      timestamp: '2024-01-01',
      databaseStatus: 'initializing',
    });

    const { result, unmount } = renderHook(() => usePing());

    // Resolve initial ping
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.status).toBe('disconnected');

    unmount();

    // Advance time — ping should NOT be called again
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });

    expect(ping).toHaveBeenCalledTimes(1);
  });
});
