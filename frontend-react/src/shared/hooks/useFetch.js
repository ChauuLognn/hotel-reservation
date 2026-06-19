import { useState, useCallback } from 'react';

export function useFetch(apiFn, options = {}) {
  const { initialData = null, onSuccess, onError } = options;
  const [data, setData]       = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(...args);
      const result = res.data?.data ?? res.data;
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setError(msg);
      onError?.(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn, onError, onSuccess]);

  return { data, loading, error, execute, setData };
}
