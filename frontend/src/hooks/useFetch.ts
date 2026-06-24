import { useState, useCallback } from 'react';

interface AxiosLikeResponse<T> {
  data: {
    data?: T;
    success?: boolean;
    message?: string;
  } | T;
}

interface UseFetchOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useFetch<T, Args extends any[]>(
  apiFn: (...args: Args) => Promise<AxiosLikeResponse<T>>,
  options: UseFetchOptions<T> = {}
) {
  const { initialData = null, onSuccess, onError } = options;
  const [data, setData]       = useState<T | null>(initialData as T | null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError]     = useState<string | null>(null);

  const execute = useCallback(async (...args: Args): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(...args);
      const result = res.data as T;
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Có lỗi xảy ra';
      setError(msg);
      onError?.(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn, onError, onSuccess]);

  return { data, loading, error, execute, setData };
}
