import clsx from 'clsx';

const variants = {
  primary: 'bg-app-charcoal text-white hover:bg-app-teal',
  secondary: 'bg-app-sand text-app-charcoal hover:bg-app-gold/60',
  ghost: 'bg-transparent text-app-charcoal hover:bg-app-charcoal/5',
  danger: 'bg-app-coral text-white hover:bg-app-coral/90'
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
        'inline-flex items-center justify-center rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'px-3 py-2 text-xs' : 'px-5 py-3 text-sm',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
