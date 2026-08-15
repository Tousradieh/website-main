import { cn } from '@/lib/utils';
import { PROJECT_STATUS_LABELS } from '@/lib/constants';
import type { Project } from '@/lib/types';

type StatusTone = 'onDark' | 'onImage' | 'onLight';

interface ProjectStatusBadgeProps {
  status: Project['status'];
  tone: StatusTone;
}

const TONE_CLASSES: Record<StatusTone, Record<Project['status'], string>> = {
  onDark: {
    active: 'bg-success-emphasis/20 text-success-foreground',
    completed: 'bg-accent/20 text-accent',
  },
  onImage: {
    active: 'bg-success-emphasis/90 text-white',
    completed: 'bg-brand-800/90 text-brand-100',
  },
  onLight: {
    active: 'bg-success-muted text-success',
    completed: 'bg-brand-100 text-brand-700',
  },
};

export default function ProjectStatusBadge({ status, tone }: ProjectStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONE_CLASSES[tone][status],
      )}
    >
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}
