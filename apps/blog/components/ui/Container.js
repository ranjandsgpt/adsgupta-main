export default function Container({ children, wide = false }) {
  return <div className={wide ? "shell-wide" : "shell"}>{children}</div>;
}

