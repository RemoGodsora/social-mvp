import { Sparkles, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export default function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="py-16 px-6 text-center flex flex-col items-center justify-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center text-gray-500 dark:text-neutral-400">
        <Icon size={22} />
      </div>

      <div className="space-y-1 max-w-xs">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-neutral-400 leading-relaxed">
          {description}
        </p>
      </div>

      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-2 text-xs font-semibold px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}