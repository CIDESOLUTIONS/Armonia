// src/hooks/use-passive-event.ts
import { useEffect } from 'react';

interface PassiveEventOptions {
  passive?: boolean;
  capture?: boolean;
}

export function usePassiveEvent(
  element: HTMLElement | null | Window,
  eventName: string,
  handler: EventListener,
  options: PassiveEventOptions = { passive: true }
) {
  useEffect(() => {
    if (!element) return;

    element.addEventListener(eventName, handler, options);
    return () => {
      element.removeEventListener(eventName, handler);
    };
  }, [element, eventName, handler, options.passive, options.capture]);
}