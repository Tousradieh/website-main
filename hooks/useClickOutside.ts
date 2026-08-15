import { useEffect, useRef, type RefObject } from 'react';

export function useClickOutside(
  refs: Array<RefObject<HTMLElement | null>>,
  onOutside: () => void,
) {
  const refsRef = useRef(refs);
  const onOutsideRef = useRef(onOutside);

  useEffect(() => {
    refsRef.current = refs;
    onOutsideRef.current = onOutside;
  });

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const inside = refsRef.current.some((ref) => ref.current?.contains(target));
      if (!inside) onOutsideRef.current();
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);
}
