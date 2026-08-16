import { cn } from './utils';

export function formFieldClass(invalid: boolean) {
  return cn(
    'px-4 py-2.5 rounded-md border bg-background text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
    invalid ? 'border-destructive' : 'border-input',
  );
}
