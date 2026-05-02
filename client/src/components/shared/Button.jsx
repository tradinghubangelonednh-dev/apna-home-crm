import clsx from 'clsx';

const variants = {
  primary:
    'bg-app-primary text-white hover:bg-app-primaryHover shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30',

  secondary:
    'bg-app-surfaceLight text-app-text border border-app-border hover:border-app-primary hover:bg-app-surface',

  ghost:
    'bg-transparent text-app-muted hover:bg-app-surface hover:text-app-text',

  danger:
    'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
};

export function Button({
  as: Component = 'button',
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) {
  return (
    <Component
      className={clsx(
        'inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',

        size === 'sm'
          ? 'px-3 py-2 text-xs'
          : 'px-5 py-3 text-sm',

        variants[variant],

        className
      )}
      {...props}
    />
  );
}