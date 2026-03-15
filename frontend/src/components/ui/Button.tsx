import type {
  ButtonProps,
  ButtonShape as Shape,
  ButtonSize as Size,
  ButtonVariant as Variant,
} from '../../types/props/component-props.types';

const variantStyles: Record<Variant, string> = {
  primary: 'bg-[#1CA2EA] text-[#041325] font-bold hover:bg-[#1CA2EA]/90',
  secondary: 'bg-brand text-white font-semibold hover:bg-brand/80',
  outline: 'border border-white/30 text-white font-semibold hover:border-white/60',
  ghost: 'text-muted hover:text-white',
  danger: 'bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20',
  'auth-outline': 'border border-[#2f73bf] bg-[#041325]/45 text-[#8AB8F0] hover:bg-[#041325]/60',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-5 py-3 text-[17px]',
};

const shapeStyles: Record<Shape, string> = {
  pill: 'rounded-full',
  rect: 'rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  fullWidth = false,
  loading = false,
  leftIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        shapeStyles[shape],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      {children}
    </button>
  );
}
