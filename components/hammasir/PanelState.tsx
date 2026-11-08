import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PanelStateProps {
  error: string | null;
  onRetry: () => void;
}

/** Loading spinner, or an error with a retry button, while a panel's data is not ready. */
export default function PanelState({ error, onRetry }: PanelStateProps) {
  if (!error) {
    return (
      <div className="flex justify-center py-16 text-brand-700" role="status" aria-label="در حال بارگذاری">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-8 text-center">
      <p role="alert" className="text-sm text-destructive mb-4">
        {error}
      </p>
      <Button type="button" variant="outline" onClick={onRetry} className="h-auto px-5 py-2 rounded-md">
        تلاش دوباره
      </Button>
    </div>
  );
}
