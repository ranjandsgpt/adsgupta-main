import { useCallback, useEffect, useState } from 'react';

const storageFor = (scope) => {
  if (typeof window === 'undefined') return null;
  if (scope === 'session') return window.sessionStorage;
  if (scope === 'local') return window.localStorage;
  return null;
};

export function useDismissState({
  key,
  scope = 'component',
  escape = true,
  onDismiss,
} = {}) {
  const storage = storageFor(scope);
  const storageKey = key ? `creative-dismissed:${key}` : null;
  const [dismissed, setDismissed] = useState(
    () => Boolean(storage && storageKey && storage.getItem(storageKey) === 'true'),
  );

  const dismiss = useCallback((reason = 'close') => {
    setDismissed(true);
    if (storage && storageKey) storage.setItem(storageKey, 'true');
    onDismiss?.(reason);
  }, [onDismiss, storage, storageKey]);

  const reset = useCallback(() => {
    setDismissed(false);
    if (storage && storageKey) storage.removeItem(storageKey);
  }, [storage, storageKey]);

  useEffect(() => {
    if (!escape || dismissed) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') dismiss('escape');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dismiss, dismissed, escape]);

  return { dismissed, dismiss, reset };
}
