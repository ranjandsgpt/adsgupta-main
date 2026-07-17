import React from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function MorphContainer({
  as: Component = 'div',
  children,
  className = '',
  duration = 300,
  style,
  ...props
}) {
  const reducedMotion = useReducedMotion();

  return (
    <Component
      className={className}
      style={{
        ...style,
        transition: reducedMotion ? 'none' : `all ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
