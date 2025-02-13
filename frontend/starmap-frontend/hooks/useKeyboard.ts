// src/hooks/useKeyboard.ts
import { useEffect, useRef } from 'react';

export function useKeyboard() {
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      keysPressedRef.current[event.key.toLowerCase()] = true;
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keysPressedRef.current[event.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return keysPressedRef;
}
