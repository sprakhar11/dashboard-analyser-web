import { useState, useEffect, useRef } from 'react';
import { ping } from '../services/health.js';

const POLL_INTERVAL_MS = 10_000;

/**
 * @returns {{ status: 'loading' | 'connected' | 'disconnected' | 'error', databaseStatus: string | null, error: string | null }}
 */
export function usePing() {
  const [status, setStatus] = useState('loading');
  const [databaseStatus, setDatabaseStatus] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const executePing = async () => {
    try {
      const data = await ping();
      setDatabaseStatus(data.databaseStatus);
      setError(null);
      if (data.databaseStatus === 'connected') {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    } catch (err) {
      setDatabaseStatus(null);
      setError(err.message);
      setStatus('error');
    }
  };

  // Call ping on mount
  useEffect(() => {
    executePing();
  }, []);

  // Set up / tear down polling based on status
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (status === 'disconnected' || status === 'error') {
      intervalRef.current = setInterval(executePing, POLL_INTERVAL_MS);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status]);

  return { status, databaseStatus, error };
}
