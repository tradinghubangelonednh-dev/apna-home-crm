import clsx from 'clsx';

export function Card({ className, children }) {
  return <div className={clsx('app-panel p-5', className)}>{children}</div>;
}
