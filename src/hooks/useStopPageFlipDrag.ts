import { useEffect, useRef } from "react";

// react-pageflip attaches its own drag-to-flip mousedown listener directly
// (via native addEventListener) on an ancestor element several levels above
// any of our components. React's onMouseDown/onTouchStart/onPointerDown JSX
// props are delegated to a single listener way up at the app root — so the
// *native* event physically bubbles through page-flip's own listener first,
// where it calls preventDefault() and blocks focus, before React's synthetic
// dispatch (and a stopPropagation call inside it) ever runs. The only real
// fix is a native listener on an intermediate ancestor — this hook does that.
export function useStopPageFlipDrag<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stop = (e: Event) => e.stopPropagation();
    const types = ["mousedown", "touchstart", "pointerdown"] as const;
    for (const type of types) el.addEventListener(type, stop);
    return () => {
      for (const type of types) el.removeEventListener(type, stop);
    };
  }, []);
  return ref;
}