import { useEffect, type ReactNode } from 'react';
import { Check, ChevronDown, X, Info, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn, clamp } from '@/lib/utils';

/* ------------------------------- Button ------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] border border-transparent shadow-sm',
  secondary:
    'bg-[var(--surface-2)] text-fg border border-border hover:bg-[var(--surface-3)] hover:border-border-strong',
  ghost: 'bg-transparent text-fg-muted hover:text-fg hover:bg-[var(--surface-2)] border border-transparent',
  danger: 'bg-danger-soft text-danger border border-transparent hover:bg-[var(--danger)] hover:text-white',
  success: 'bg-success text-white border border-transparent hover:opacity-90',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-[15px] gap-2',
  icon: 'h-9 w-9 p-0 justify-center',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors select-none',
        'disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

/* -------------------------------- Card -------------------------------- */

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-surface border border-border rounded-2xl', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-5 pt-4 pb-3', className)}>
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="text-[13px] text-fg-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ------------------------------- Inputs ------------------------------- */

const fieldClass =
  'w-full bg-[var(--surface-2)] border border-border rounded-lg px-3 py-2 text-sm text-fg placeholder:text-fg-faint ' +
  'focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, 'h-10', className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClass, 'min-h-[84px] resize-y leading-relaxed', className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(fieldClass, 'h-10 appearance-none pr-9 cursor-pointer', className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-faint" />
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[13px] font-medium text-fg-muted">{label}</span>
      {children}
      {hint && <span className="block text-[12px] text-fg-faint">{hint}</span>}
    </label>
  );
}

/* ------------------------------- Badge -------------------------------- */

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'violet' | 'cyan';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-[var(--surface-3)] text-fg-muted border border-border',
  accent: 'bg-accent-soft text-[var(--accent)] border border-transparent',
  success: 'bg-success-soft text-[var(--success)] border border-transparent',
  warning: 'bg-warning-soft text-[var(--warning)] border border-transparent',
  danger: 'bg-danger-soft text-[var(--danger)] border border-transparent',
  violet: 'bg-[color-mix(in_srgb,var(--violet)_14%,transparent)] text-[var(--violet)] border border-transparent',
  cyan: 'bg-[color-mix(in_srgb,var(--cyan)_14%,transparent)] text-[var(--cyan)] border border-transparent',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------ Checkbox ------------------------------ */

export function Checkbox({
  checked,
  onChange,
  size = 20,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  size?: number;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      style={{ width: size, height: size }}
      className={cn(
        'shrink-0 rounded-md border-2 flex items-center justify-center transition-all',
        'hover:border-[var(--accent)] disabled:opacity-40',
        checked
          ? 'bg-[var(--success)] border-[var(--success)] text-white'
          : 'bg-[var(--surface-2)] border-border-strong',
      )}
    >
      {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </button>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors shrink-0',
        checked ? 'bg-[var(--accent)]' : 'bg-[var(--surface-3)] border border-border',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-5',
        )}
      />
    </button>
  );
}

/* ------------------------------ Progress ------------------------------ */

export function Progress({
  value,
  className,
  tone = 'accent',
  height = 8,
}: {
  value: number;
  className?: string;
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'violet' | 'cyan';
  height?: number;
}) {
  const v = clamp(Math.round(value));
  const color =
    tone === 'success'
      ? 'var(--success)'
      : tone === 'warning'
        ? 'var(--warning)'
        : tone === 'danger'
          ? 'var(--danger)'
          : tone === 'violet'
            ? 'var(--violet)'
            : tone === 'cyan'
              ? 'var(--cyan)'
              : 'var(--accent)';
  return (
    <div
      className={cn('w-full rounded-full bg-[var(--surface-3)] overflow-hidden', className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${v}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 84,
  stroke = 8,
  label,
  sub,
  tone = 'var(--accent)',
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: ReactNode;
  sub?: ReactNode;
  tone?: string;
}) {
  const v = clamp(value);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-[var(--surface-3)]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke={tone}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        {label ?? <span className="font-semibold tabular text-[17px]">{Math.round(v)}%</span>}
        {sub}
      </div>
    </div>
  );
}

/* -------------------------------- Tabs -------------------------------- */

export function Tabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { id: string; label: string; icon?: ReactNode; count?: number }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-1 p-1 bg-[var(--surface-2)] rounded-xl overflow-x-auto no-scrollbar', className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors',
            value === t.id
              ? 'bg-surface text-fg shadow-sm border border-border'
              : 'text-fg-muted hover:text-fg border border-transparent',
          )}
        >
          {t.icon}
          {t.label}
          {typeof t.count === 'number' && (
            <span className="text-[11px] text-fg-faint tabular">{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------- Modal -------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-fade-up"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full bg-surface border border-border rounded-t-2xl sm:rounded-2xl shadow-md',
          'max-h-[92vh] flex flex-col animate-fade-up',
          wide ? 'sm:max-w-3xl' : 'sm:max-w-lg',
        )}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-[16px] font-semibold tracking-tight">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-5 py-4 overflow-y-auto grow">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-border flex justify-end gap-2 shrink-0">{footer}</div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Feedback ------------------------------ */

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-6">
      <div className="h-11 w-11 rounded-xl bg-[var(--surface-2)] border border-border flex items-center justify-center text-fg-faint mb-3">
        {icon ?? <Info className="h-5 w-5" />}
      </div>
      <p className="text-sm font-medium">{title}</p>
      {body && <p className="text-[13px] text-fg-muted mt-1 max-w-sm">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-lg', className)} />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-56 rounded-2xl" />
    </div>
  );
}

export function Toast({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}) {
  const Icon = type === 'error' ? AlertTriangle : type === 'info' ? Info : CheckCircle2;
  const tone =
    type === 'error'
      ? 'text-[var(--danger)]'
      : type === 'info'
        ? 'text-[var(--accent)]'
        : 'text-[var(--success)]';
  return (
    <div className="fixed z-[60] bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 animate-fade-up">
      <div className="flex items-center gap-2.5 bg-surface border border-border rounded-xl shadow-md px-4 py-3 max-w-[92vw]">
        <Icon className={cn('h-4.5 w-4.5 shrink-0', tone)} />
        <span className="text-sm">{message}</span>
        <button onClick={onDismiss} className="text-fg-faint hover:text-fg ml-1" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ Page bits ------------------------------ */

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-[13px] text-fg-muted mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

export function SectionTitle({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-3 mb-3', className)}>
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-fg-faint">
        {children}
      </h2>
      {action}
    </div>
  );
}
