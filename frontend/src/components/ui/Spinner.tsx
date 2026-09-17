interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function Spinner({ size = 'md', label }: SpinnerProps) {
  return (
    <span className={`spinner spinner--${size}`} role="status" aria-live="polite">
      {/* Visually hidden, but screen readers announce the loading state. */}
      <span className="sr-only">{label ?? 'Loading'}</span>
    </span>
  );
}

export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="page-loader">
      <Spinner size="lg" label={label} />
      <p>{label}…</p>
    </div>
  );
}
