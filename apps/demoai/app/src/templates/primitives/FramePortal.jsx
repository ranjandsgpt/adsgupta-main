import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function getPreviewOverlayRoot() {
  if (typeof document === 'undefined') return null;
  return document.getElementById('creative-preview-overlay-root');
}

export function FramePortal({ children, enabled = true }) {
  // Kept in state so a root that mounts after the first render is still picked up.
  const [root, setRoot] = useState(getPreviewOverlayRoot);

  useEffect(() => {
    if (!enabled || root) return;
    setRoot(getPreviewOverlayRoot());
  }, [enabled, root]);

  if (!enabled || !root) return children;
  return createPortal(
    <div className="pointer-events-auto absolute inset-0 z-[95] overflow-hidden">
      {children}
    </div>,
    root,
  );
}
