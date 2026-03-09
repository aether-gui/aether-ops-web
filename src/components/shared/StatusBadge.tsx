import { CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

type Variant = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'neutral';

interface StatusBadgeProps {
  variant: Variant;
  label: string;
}

const config: Record<Variant, { bg: string; text: string; icon: typeof CheckCircle | null }> = {
  success: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle },
  error: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700', icon: AlertTriangle },
  info: { bg: 'bg-sky-50', text: 'text-sky-700', icon: Info },
  loading: { bg: 'bg-sky-50', text: 'text-sky-700', icon: Loader2 },
  neutral: { bg: 'bg-gray-100', text: 'text-gray-600', icon: null },
};

export default function StatusBadge({ variant, label }: StatusBadgeProps) {
  const c = config[variant];
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
    >
      {Icon && (
        <Icon size={13} className={variant === 'loading' ? 'animate-spin' : ''} />
      )}
      {label}
    </span>
  );
}
