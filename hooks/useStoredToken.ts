import { useSyncExternalStore } from 'react';
import type { TokenStore } from '@/lib/hammasir';

/** Current token from browser storage; undefined during prerender and hydration. */
export function useStoredToken(store: TokenStore): string | undefined {
  return useSyncExternalStore<string | undefined>(store.subscribe, store.get, () => undefined);
}
