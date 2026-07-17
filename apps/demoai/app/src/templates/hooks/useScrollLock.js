import { useEffect } from 'react';

let lockCount = 0;
let restoreStyles = null;

function lockDocument() {
  const { body, documentElement } = document;
  const appScroller = document.getElementById('demo-scroll-area');
  const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
  const previous = {
    bodyOverflow: body.style.overflow,
    bodyPaddingRight: body.style.paddingRight,
    bodyTouchAction: body.style.touchAction,
    htmlOverflow: documentElement.style.overflow,
    appOverflow: appScroller?.style.overflow,
    appTouchAction: appScroller?.style.touchAction,
  };

  if (appScroller) {
    appScroller.style.overflow = 'hidden';
    appScroller.style.touchAction = 'none';
  } else {
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    documentElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
  }

  restoreStyles = () => {
    body.style.overflow = previous.bodyOverflow;
    body.style.paddingRight = previous.bodyPaddingRight;
    body.style.touchAction = previous.bodyTouchAction;
    documentElement.style.overflow = previous.htmlOverflow;
    if (appScroller) {
      appScroller.style.overflow = previous.appOverflow || '';
      appScroller.style.touchAction = previous.appTouchAction || '';
    }
  };
}

export function useScrollLock(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return undefined;

    if (lockCount === 0) lockDocument();
    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0 && restoreStyles) {
        restoreStyles();
        restoreStyles = null;
      }
    };
  }, [enabled]);
}
