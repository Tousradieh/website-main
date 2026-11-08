import { useCallback, useEffect, useState } from 'react';
import { hammasirApi, type ApiResult } from '@/lib/hammasir';

/** Loads a GET endpoint of the campaign API; a 401 calls onSessionExpired. */
export function useHammasirData<T>(path: string, token?: string, onSessionExpired?: () => void) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback(
    (result: ApiResult<T>) => {
      if (result.ok) {
        setData(result);
        setError(null);
      } else if (result.status === 401 && onSessionExpired) {
        onSessionExpired();
      } else {
        setError(result.error);
      }
    },
    [onSessionExpired],
  );

  useEffect(() => {
    let active = true;
    void hammasirApi<T>(path, { token }).then((result) => {
      if (active) apply(result);
    });
    return () => {
      active = false;
    };
  }, [path, token, apply]);

  const reload = useCallback(() => {
    setError(null);
    void hammasirApi<T>(path, { token }).then(apply);
  }, [path, token, apply]);

  return { data, error, reload };
}
