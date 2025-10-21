import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface ProBadgeProps {
  variant?: 'default' | 'small' | 'large';
  className?: string;
}

export function ProBadge({ variant = 'default', className }: ProBadgeProps) {
  const sizes = {
    small: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-1 text-sm',
    large: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        'bg-gradient-to-r from-purple-600 to-pink-600',
        'text-white shadow-lg shadow-purple-500/50',
        'ring-2 ring-white/20',
        'transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/70',
        sizes[variant],
        className
      )}
    >
      <Icon icon="solar:crown-bold" className="h-3.5 w-3.5" />
      <span>PRO</span>
    </span>
  );
}

