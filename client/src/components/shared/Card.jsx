import clsx from 'clsx';

export function Card({ className, children }) {
  return (
    <div
      className={clsx(
        'bg-white border border-gray-200 rounded-2xl p-5 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}